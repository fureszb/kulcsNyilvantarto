<?php

namespace App\Jobs;

use App\Models\AiDocument;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class ProcessDocumentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 900; // nagy fájl + CPU-s embedding esetére

    /** @var array<int> */
    public array $backoff = [30, 120];

    public function __construct(
        public string $tenantSlug,
        public int $userId,
        public int $documentId,
    ) {}

    public function handle(): void
    {
        $this->bindTenantConnection();

        $document = AiDocument::find($this->documentId);
        if (!$document) {
            return;
        }

        $document->update(['status' => 'processing']);

        $absolutePath = Storage::disk('local')->path($document->stored_path);

        $response = Http::withHeaders([
                'X-Internal-Token' => config('services.rag.token'),
            ])
            ->timeout(840)
            ->attach('file', fopen($absolutePath, 'r'), $document->original_name)
            ->post(config('services.rag.url') . '/ingest', [
                'tenant_id' => $this->tenantSlug,
                'user_id' => (string) $this->userId,
                'document_id' => (string) $document->id,
            ]);

        if ($response->failed()) {
            throw new \RuntimeException(
                'RAG ingest hiba: HTTP ' . $response->status() . ' — ' . $response->body()
            );
        }

        $document->update([
            'status' => 'ready',
            'chunk_count' => $response->json('chunks', 0),
            'error_message' => null,
        ]);
    }

    public function failed(?\Throwable $e): void
    {
        $this->bindTenantConnection();

        AiDocument::where('id', $this->documentId)->update([
            'status' => 'failed',
            'error_message' => mb_substr($e?->getMessage() ?? 'Ismeretlen hiba', 0, 1000),
        ]);
    }

    private function bindTenantConnection(): void
    {
        // A queue worker tenant-kontextus nélkül fut — ugyanaz a minta,
        // mint a TenantMiddleware-ben.
        config([
            'database.connections.tenant.database' =>
                storage_path('database/tenants/' . $this->tenantSlug . '.sqlite'),
        ]);
        DB::purge('tenant');
    }
}
