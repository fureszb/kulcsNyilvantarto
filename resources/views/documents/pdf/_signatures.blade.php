{{-- $roles: [['key'=>'tanu','label'=>'Tanú'], ...], $signatureImages: [role => base64 dataURL] --}}
<div class="section">
    <div class="section-label">Aláírások</div>
    <table class="sign-table">
        <tr>
            @foreach ($roles as $r)
                <td>
                    <div class="sign-box">
                        @if (!empty($signatureImages[$r['key']]))
                            <img src="{{ $signatureImages[$r['key']] }}">
                        @else
                            <span class="sign-box-empty">nincs aláírás</span>
                        @endif
                    </div>
                    <p class="sign-role">{{ $r['label'] }}</p>
                </td>
            @endforeach
        </tr>
    </table>
</div>
