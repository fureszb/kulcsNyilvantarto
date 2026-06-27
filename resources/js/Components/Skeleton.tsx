interface Props {
    count?: number;
    height?: string;
    rounded?: string;
    className?: string;
}

export default function Skeleton({ count = 1, height = 'h-4', rounded = 'rounded', className = '' }: Props) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`dui-skeleton ${height} ${rounded} w-full ${className}`.trim()} />
            ))}
        </>
    );
}
