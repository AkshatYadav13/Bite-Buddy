import { API_END_POINT } from "@/lib/constants";
import { AdminState } from "@/types/adminType";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useAdminStore = create<AdminState>()(persist(
    (set)=>({
        loading:false,
        stats:null,

        getAdminStats: async () => {
            set({loading:true})
            try {
            const res = await fetch(`${API_END_POINT}/admin/get/stats`, {
                method: "GET",
                credentials: "include",
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message)
                return;
            }
            if (data.success) {
                set({stats:data})
            }
            } catch (error) {
                console.log(error);
                toast.error("Unexpected error occured, try again later");
            }finally{
                set({loading:false})
            }
        },

        resetStore:()=>{
            set({
                loading:false,
                stats:null
            })
      }
    }),
    {
        name:'admin-store',
        storage:createJSONStorage(()=> localStorage)
    }
))