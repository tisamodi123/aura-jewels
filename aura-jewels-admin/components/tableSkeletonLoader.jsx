const TableSkeletonLoader = ({ rowLength = 20 }) => {
    return (
        <div className="w-full space-y-3">
            {Array.from({ length: rowLength }).map((_, index) => (
                <div key={index} className="h-5 w-full bg-gray-200 animate-pulse rounded-md"></div>
            ))}
        </div>
    );
};

export default TableSkeletonLoader