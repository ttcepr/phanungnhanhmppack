
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { IconSettings, IconCloud, IconDatabase, IconSave, IconCheckCircle } from './Icons';

interface SettingsProps {
    settings: AppSettings;
    onSaveSettings: (newSettings: AppSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSaveSettings }) => {
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleChange = (key: keyof AppSettings, value: any) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate save delay
        setTimeout(() => {
            onSaveSettings(localSettings);
            setIsSaving(false);
            alert("Đã lưu thiết lập thành công!");
        }, 800);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 p-6 overflow-y-auto">
            <div className="mb-8 flex items-center gap-3">
                <div className="bg-slate-100 p-3 rounded-xl text-slate-600">
                    <IconSettings className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Thiết lập Hệ thống</h1>
                    <p className="text-sm text-gray-500">Cấu hình đồng bộ dữ liệu và lưu trữ</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
                
                {/* 1. DATA SYNC CONFIG */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-6 border-b pb-2">
                        <IconDatabase className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-800">Sao lưu & Đồng bộ Google Sheet</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Sao lưu Dữ liệu Cục bộ (Local Backup)</label>
                                <p className="text-xs text-gray-500 mt-1">Lưu bản nháp ngay trên thiết bị để phòng mất kết nối</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={localSettings.enableLocalBackup}
                                    onChange={(e) => handleChange('enableLocalBackup', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tần suất đồng bộ Google Sheet (Phút)</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    min="1"
                                    max="1440"
                                    className="w-24 border border-gray-300 rounded-lg p-2 text-center font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={localSettings.syncIntervalMinutes}
                                    onChange={(e) => handleChange('syncIntervalMinutes', parseInt(e.target.value) || 60)}
                                />
                                <span className="text-sm text-gray-500">phút / lần</span>
                            </div>
                            <p className="text-xs text-orange-500 mt-2 italic">*Hệ thống sẽ tự động đồng bộ dữ liệu hồ sơ lên Google Sheet theo chu kỳ này.</p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                             <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Trạng thái đồng bộ</h4>
                             <div className="flex justify-between items-center text-sm">
                                 <span className="text-gray-600">Lần cuối đồng bộ:</span>
                                 <span className="font-mono font-bold text-blue-700">{localSettings.lastSyncTime || 'Chưa đồng bộ'}</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* 2. GOOGLE DRIVE CONFIG */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-6 border-b pb-2">
                        <IconCloud className="w-5 h-5 text-green-600" />
                        <h2 className="text-lg font-bold text-gray-800">Lưu trữ Hình ảnh (Google Drive)</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tên Thư mục Lưu trữ</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    className="flex-1 bg-gray-100 border border-gray-200 rounded-lg p-2 text-gray-600 cursor-not-allowed"
                                    value={localSettings.googleDriveFolder}
                                    readOnly
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Mặc định hệ thống tự tạo thư mục này trên Drive của tài khoản Admin.</p>
                        </div>
                        
                        <div className="flex items-start gap-3 bg-green-50 p-4 rounded-lg border border-green-100">
                            <IconCheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-green-800">Cơ chế hoạt động</p>
                                <p className="text-xs text-green-700 mt-1 leading-relaxed">
                                    Hình ảnh upload từ Chat sẽ được lưu trực tiếp vào thư mục trên. Đường dẫn (Link) sẽ được lưu vào Hồ sơ trong Google Sheet.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="mt-8">
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-transform active:scale-95 disabled:opacity-70"
                >
                    {isSaving ? (
                        <>Đang lưu...</>
                    ) : (
                        <>
                            <IconSave className="w-5 h-5" /> Lưu thiết lập
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Settings;
