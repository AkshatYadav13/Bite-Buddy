import { Server } from 'socket.io'
import { server } from '../app'

const io = new Server(server,{
  cors:{
    origin:'http://localhost:5173',
    methods:["GET","POST","PUT"],
    credentials:true
  }  
})

export const userSocketMap:Record<string,string> = {}

io.on("connection",async(socket)=>{
    const userId = socket.handshake.query.userId as string

    if(userId){
        userSocketMap[userId] = socket.id
        console.log(`User connected..   User id: ${userId}  Socket id: ${socket.id}`)
    }
    socket.on('disconnect',async()=>{
        if(userId){
            delete userSocketMap[userId]
            console.log(`User disconnected..  User id: ${userId}  Socket id: ${socket.id}`)
        }
    })
})
export {server,io};


export function getUserSocketId(userId:string): string{
    return userSocketMap[userId]
}
