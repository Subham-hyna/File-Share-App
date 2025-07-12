import { produce } from "immer";
import { Alert } from "react-native";
import { useChunkStore } from "../db/chunkStorage";
import { Buffer } from "buffer";

export const receiveFileAck = async (
    data: any,
    socket: any,
    setReceivedFiles: any,
) => {
    const { setChunkStore, chunkStore } = useChunkStore.getState();

    if (chunkStore) {
        Alert.alert('There are files which need to be received');
        return;
    }

   setReceivedFiles((prevData: any) => 
        produce(prevData, (draft: any) => {
            draft.push(data);
        })
   )

   setChunkStore({
    id: data?.id,
    totalChunks: data?.totalChunks,
    name: data?.name,
    mimeType: data?.mimeType,
    size: data?.size,
    chunkArray: [],
   })

   if(!socket) {
    console.error('no socket to receive file');
    return;
   }

   try {
    await new Promise((resolve)=> setTimeout(resolve, 10));
    console.log('file received');
    socket.write(JSON.stringify({event: 'send_chunk_ack', chunkNo: 0}))
    console.log('Requested for firsst chunk')
   } catch (error) {
        console.error('error receiving file', error);
   }
}

export const sendChunkAck = async (
    chunkIndex: number,
    socket: any,
    setTotalSentBytes: any,
    setSentFiles: any,
) => {
    const { currentChunkSet, resetCurrentChunkSet } = useChunkStore.getState();

    if (!currentChunkSet) {
        Alert.alert('There are no files to send');
        return;
    }

    if(!socket) {
        console.error('no socket to send file');
        return;
       }

    const totalChunks = currentChunkSet?.totalChunks;

    try {
        await new Promise((resolve)=> setTimeout(resolve, 10));
        socket.write(JSON.stringify({
            event: 'receive_chunk_ack',
            chunk: currentChunkSet?.chunkArray[chunkIndex].toString('base64'),
            chunkNo: chunkIndex
        }))
        setTotalSentBytes((prev: number) => prev + currentChunkSet?.chunkArray[chunkIndex]?.length);

        if (chunkIndex + 2 > totalChunks){
            console.log('ALL CHUNKS SENT');
            setSentFiles((prevFiles: any) => 
                produce(prevFiles, (draftFiles: any) => {
                    const fileIndex = draftFiles?.findIndex((f: any) => f.id === currentChunkSet?.id);
                    if (fileIndex !== -1) {
                        draftFiles[fileIndex].available = true;
                    }
                })
            )
            resetCurrentChunkSet();
        }
        
    } catch (error) {
        console.error("Error sending chunk", error);
    }
}

export const receiveChunkAck = async (
    chunk: any,
    chunkNo: number,
    socket: any,
    setTotalReceivedBytes: any,
    generateFile: any,
) => {
    const { setChunkStore, chunkStore, resetChunkStore } = useChunkStore.getState();

    if(!chunkStore) { 
        console.log('Chunk Store is null')
        return;
    }

    try {
        const bufferChunk = Buffer.from(chunk, 'base64');
        const updatedChunkArray = [...(chunkStore.chunkArray || [])]
        updatedChunkArray[chunkNo] = bufferChunk;
        setChunkStore({
            ...chunkStore,
            chunkArray: updatedChunkArray,
        })

        setTotalReceivedBytes((prev: number) => prev + bufferChunk?.length);


    } catch (error) {
        console.log('Error receiving chunk', error);
    }

    if(!socket) {
        console.error('no socket to receive chunk');
        return;
    }

    if (chunkNo + 1 === chunkStore?.totalChunks) {
        console.log('ALL CHUNKS RECEIVED');
        generateFile();
        resetChunkStore();
        return;
    }

    try {
        await new Promise((resolve)=> setTimeout(resolve, 10));
        console.log('Requested for next chunk',chunkNo + 1);
        socket.write(JSON.stringify({
            event: 'send_chunk_ack',
            chunkNo: chunkNo + 1,
        }))
    } catch (error) {
        console.log('Error receiving chunk', error);
    }
}