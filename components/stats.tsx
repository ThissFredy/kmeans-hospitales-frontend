'use client';

interface StatsGridProps {
	avgDistance: string | number;
	mappedResidences: number;
	totalResidences: number;
	facilitiesCount: number;
	isOptimized: boolean;
}

export default function StatsGrid({
	avgDistance,
	mappedResidences,
	totalResidences,
	facilitiesCount,
	isOptimized,
}: StatsGridProps) {
	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
			<div className="bg-card border border-border/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
				<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
					Coverage
				</p>
				<p className="text-2xl font-bold text-foreground mt-2">
					{((mappedResidences / totalResidences) * 100).toFixed(0)}%
				</p>
				<p className="text-xs text-muted-foreground mt-1">
					{mappedResidences} of {totalResidences} areas
				</p>
			</div>

			<div className="bg-card border border-border/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
				<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
					Facilities
				</p>
				<p className="text-2xl font-bold text-primary mt-2">
					{facilitiesCount}
				</p>
				<p className="text-xs text-muted-foreground mt-1">Active facilities</p>
			</div>

			{isOptimized && (
				<div className="bg-card border border-border/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
						Avg Distance
					</p>
					<p className="text-2xl font-bold text-accent mt-2">{avgDistance}</p>
					<p className="text-xs text-muted-foreground mt-1">Units per area</p>
				</div>
			)}

			<div className="bg-card border border-border/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
				<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
					Status
				</p>
				<p className="text-lg font-bold mt-2">
					<span
						className={
							isOptimized
								? 'text-green-600 dark:text-green-400'
								: 'text-yellow-600 dark:text-yellow-400'
						}
					>
						{isOptimized ? '✓ Optimized' : 'In Progress'}
					</span>
				</p>
				<p className="text-xs text-muted-foreground mt-1">Algorithm status</p>
			</div>
		</div>
	);
}
