export function ProductTableSkeleton() {
    return (
        <div className="w-full overflow-x-auto border border-gray-300">
            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="w-12 p-3 text-left border-b border-r border-gray-300">
                            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </th>
                        <th className="p-3 text-left border-b border-r border-gray-300">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </th>
                        <th className="p-3 text-left min-w-[200px] border-b border-r border-gray-300">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </th>
                        <th className="p-3 text-left min-w-[300px] border-b border-gray-300">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </th>
                    </tr>
                    <tr className="bg-white">
                        <th className="p-3 border-b border-r border-gray-300"></th>
                        <th className="p-3 border-b border-r border-gray-300">
                            <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
                        </th>
                        <th className="p-3 border-b border-r border-gray-300">
                            <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
                        </th>
                        <th className="p-3 border-b border-gray-300">
                            <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {[...Array(5)].map((_, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                            <td className="p-3 border-b border-r border-gray-300">
                                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                            <td className="p-3 border-b border-r border-gray-300">
                                <div className="w-24 h-24 m-auto bg-gray-200 rounded animate-pulse"></div>
                            </td>
                            <td className="p-3 border-b border-r border-gray-300">
                                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                            <td className="p-3 border-b border-gray-300">
                                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
