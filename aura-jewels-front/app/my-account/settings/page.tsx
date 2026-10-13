

export default function SettingsPage() {
    return (
        <div className="space-y-12 animate-fadeIn">
            <h3 className="text-3xl serif text-gray-900 mb-8 pb-4 border-b border-gray-50">Settings & Preference</h3>
            <div className="p-12 bg-white border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-lg font-bold text-gray-900 font-jakarta">Email Notifications</h4>
                        <p className="text-sm text-gray-500 font-jakarta">Receive updates about your orders and luxury news.</p>
                    </div>
                    <div className="w-12 h-6 bg-[#B57A5A] rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}