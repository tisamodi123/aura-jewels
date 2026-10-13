import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

export default function NotificationPage() {
  return (
    <>
      <div className="max-w-4xl mx-auto  bg-white rounded-lg mb-6 shadow-sm">
        <div className="">
          <div className=" px-6 pt-6 ">
            <h2 className="text-[0.98rem] font-semibold mb-2">Notifications</h2>
            <div className="flex border-b-[1px]  border-[#E4E8EE] justify-between">
              <p className="text-[#656B7B] text-[0.80rem] w-[94%] pb-4">
                Notifications are alerts, messages, or prompts sent to users to
                provide important updates, reminders, warnings, or
                confirmations. They play a crucial role in digital
                communication, ensuring users stay informed about relevant
                events, actions, or changes within a system, application, or
                service.
              </p>
            </div>
          </div>
          <div className="px-6 mt-6 pb-6">
            <div className="border  rounded-md ">
              <div className="">
                <div className="text-[0.80rem] ">
                  <div className="border-b-[1px] border-[#E4E8EE]">
                    <Link
                      href={`/settings/notifications/customer-notifications`}
                      className="  cursor-pointer "
                    >
                      <div className="flex items-center p-3  justify-between">
                        <div className="flex flex-col ">
                          <span className="mb-0.5">Customer Notifications</span>
                          <span className="text-[#656B7B]">
                            Notify customers about order and account events
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div>
                            <ChevronRightIcon color="#656B7B" size={18} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div>
                    <Link
                      href={`/settings/notifications/staff-notifications`}
                      className="  cursor-pointer "
                    >
                      <div className="flex items-center p-3  justify-between">
                        <div className="flex flex-col ">
                          <span className="mb-0.5">Staff Notifications</span>
                          <span className="text-[#656B7B]">
                            Notify staff members about new order events
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div>
                            <ChevronRightIcon color="#656B7B" size={18} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
