<?php

namespace Tests\Unit;

use Location\Coordinate;
use Location\Polygon;
use PHPUnit\Framework\TestCase;

class GeofencePolygonTest extends TestCase
{
    private function squareAroundBudapest(): Polygon
    {
        // Kb. 1km-es négyzet a Budai Vár körül.
        $polygon = new Polygon();
        $polygon->addPoints([
            new Coordinate(47.4950, 19.0300),
            new Coordinate(47.4950, 19.0450),
            new Coordinate(47.5050, 19.0450),
            new Coordinate(47.5050, 19.0300),
        ]);

        return $polygon;
    }

    public function test_point_inside_polygon_is_contained(): void
    {
        $polygon = $this->squareAroundBudapest();

        $this->assertTrue($polygon->contains(new Coordinate(47.5000, 19.0375)));
    }

    public function test_point_outside_polygon_is_not_contained(): void
    {
        $polygon = $this->squareAroundBudapest();

        $this->assertFalse($polygon->contains(new Coordinate(47.5200, 19.0600)));
    }

    public function test_point_far_away_is_not_contained(): void
    {
        $polygon = $this->squareAroundBudapest();

        // Debrecen — egyértelműen kívül esik.
        $this->assertFalse($polygon->contains(new Coordinate(47.5316, 21.6273)));
    }
}
