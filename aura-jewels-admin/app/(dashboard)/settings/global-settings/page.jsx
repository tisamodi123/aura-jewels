'use client'
import { Button } from '@/components/ui/button';
import { API_URL } from '@/lib/APIUrl';
import { getToken } from '@/lib/auth';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { callApi } from '@/lib/callApi';
import { STATUS_CODE } from '@/lib/Constant';

const page = () => {
    const [gList, setGList] = useState([]);
    const [b2cMarginRate, setB2cMarginRate] = useState('');
    const [b2bMarginRate, setB2bMarginRate] = useState('');

    console.log('gList', gList);
    const token = getToken();

    const globleList = async () => {
        try {
            const result = await callApi(`${API_URL?.GET_GLOBLE_LIST}`, 'GET', null, token);
            if (result?.errorCode == STATUS_CODE.OK) {
                setGList(result?.data || []);
                // Set initial values from API response
                if (result?.data && result.data.length > 0) {
                    setB2cMarginRate(result.data[0]?.b2c_margin_rate?.toString() || '');
                    setB2bMarginRate(result.data[0]?.b2b_margin_rate?.toString() || '');
                }
            } else {
                console.log('error from globele list ', result.massage);
            }
        } catch (error) {
            console.log('error to get globele list', error);
        }
    };
    const [isLoading, setIsLoading] = useState(false)
    const handleSave = async () => {
        try {
            setIsLoading(true);
            const Bodaydata = new FormData();
            Bodaydata.append('b2c_margin_rate', b2cMarginRate);
            Bodaydata.append('b2b_margin_rate', b2bMarginRate);
            const resonse = await callApi(`${API_URL?.UPDATE_GLOBLE_LIST}`, 'POST', Bodaydata, token);
            if (resonse.errorCode === STATUS_CODE.OK) {
                globleList();
                toast.success(resonse.message);
                setIsLoading(false);
            } else {
                toast.error(resonse.message);
                setIsLoading(false);
            }
        } catch (error) {
            console.log('error to get globele list update :', error);
        }
    };

    const handleReset = () => {
        // Reset to original values from API
        if (gList && gList.length > 0) {
            setB2cMarginRate(gList[0]?.b2c_margin_rate?.toString() || '');
            setB2bMarginRate(gList[0]?.b2b_margin_rate?.toString() || '');
        }
    };

    useEffect(() => {
        globleList();
    }, [])

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-lg mb-6 shadow-sm">
            <div className="">
                <div className="px-6 py-6">
                    <h2 className="text-[0.98rem] font-semibold mb-2">
                        Globle setting
                    </h2>
                    <div className='flex gap-3'>
                        <div className='mt-3 w-[45%]'>
                            <h2>B2C Margin Rate (%) : </h2>
                            <input
                                type="text"
                                placeholder='Enter Margin Rate'
                                className='border-[1px] border-[#E4E8EE] w-[80%] rounded-md p-2'
                                value={b2cMarginRate}
                                onChange={(e) => setB2cMarginRate(e.target.value)}
                            />
                        </div>
                        <div className='mt-3 w-[45%]'>
                            <h2>B2B Margin Rate (%) : </h2>
                            <input
                                type="text"
                                placeholder='Enter Margin Rate'
                                className='border-[1px] border-[#E4E8EE] w-[80%] rounded-md p-2'
                                value={b2bMarginRate}
                                onChange={(e) => setB2bMarginRate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className='flex gap-3 mt-3'>
                        <Button
                            className="hand w-[130px] bg-black text-white"
                            onClick={handleSave}
                        >
                            {isLoading ? 'Loading...' : 'Save'}
                        </Button>
                        <Button
                            className="hand w-[130px] bg-black text-white"
                            onClick={handleReset}
                        >
                            Reset
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page
