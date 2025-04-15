import { useState } from "react";

export default function TopChannel() {
    const [isOpen, setIsOpen] = useState(false);

    function toggleDropdown() {
        setIsOpen(!isOpen);
    }

    function closeDropdown() {
        setIsOpen(false);
    }
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Top Channels
                </h3>  
            </div>

            <div className="my-6">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 text-theme-sm dark:text-gray-400">
                        Google
                    </span>
                    <span className="text-right text-gray-500 text-theme-sm dark:text-gray-400">
                        4.7K
                    </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 text-theme-sm dark:text-gray-400">
                        Facebook
                    </span>
                    <span className="text-right text-gray-500 text-theme-sm dark:text-gray-400">
                        3.4K
                    </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 text-theme-sm dark:text-gray-400">
                        Threads
                    </span>
                    <span className="text-right text-gray-500 text-theme-sm dark:text-gray-400">
                        2.9K
                    </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 text-theme-sm dark:text-gray-400">
                        Google
                    </span>
                    <span className="text-right text-gray-500 text-theme-sm dark:text-gray-400">
                        1.5K
                    </span>
                </div>
            </div>

           
        </div>
    );
}
