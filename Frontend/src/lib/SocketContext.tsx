import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import type { DefaultEventsMap } from "@socket.io/component-emitter";
import { useUserStore } from "@/store/useUserStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useDeliveryAgentStore } from "@/store/useDeliveryAgentStore";

type SocketType = Socket<DefaultEventsMap, DefaultEventsMap> | null;

const SocketContext = createContext<SocketType>(null);
export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const socketRef = useRef<SocketType>(null);
  const { user } = useUserStore();

  useEffect(() => {
    if (!user?._id) return;

    if (socketRef.current) return;

    const socket = io(`https://bite-buddy-reeh.onrender.com/`, {
      query: { userId: user._id },
      withCredentials: true,
      transports: ["polling", "websocket"], // ✅ IMPORTANT
    });

    socketRef.current = socket;

    // 🔌 Events
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("new-pickup-order", (data) => {
      if(user.role === "Delivery_Agent"){
        useOrderStore.getState().addNewOrder(data.orderId);
      }
    });

    socket.on("order-status-update", (data) => {
      useOrderStore.getState().updateActiveOrder(data.updatedOrder)
      
      if (user.role === "Delivery_Agent" && data.updatedOrder.assignmentType === "Fallback") {
          useDeliveryAgentStore.getState().updateAgentStatus("OnDelivery")
          useOrderStore.getState().addActiveOrder(data.updatedOrder)
        }
      }
    );

    socket.on("new-order-placed", (data) => {
      if (user.role === "Restaurant_Owner") {
        useOrderStore.getState().addNewOrder(data.orderId);
      }
    })

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id]); // ✅ ONLY userId

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};
