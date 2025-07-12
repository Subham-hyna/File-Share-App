import 'react-native-get-random-values';
import { createContext, FC, useCallback, useContext, useState } from "react";
import { useChunkStore } from "../db/chunkStorage";
import TcpSocket from 'react-native-tcp-socket';
import DeviceInfo from "react-native-device-info";
import { Alert, Platform } from "react-native";
import RNFS from 'react-native-fs'
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';
import { Buffer } from 'buffer';
import { receiveChunkAck, receiveFileAck, sendChunkAck } from './TCPUtils';
import ReactNativeBlobUtil from 'react-native-blob-util';

interface TCPContextType {
    server: any;
    client: any;
    isConnected: boolean;
    connectedDevice: any;
    sentFiles: any;
    receivedFiles: any;
    totalSentBytes: number;
    totalReceivedBytes: number;
    useTLS: boolean;
    startServer: (port: number, useTLS?: boolean) => void;
    connectToServer: (host: string, port: number, deviceName: string, useTLS?: boolean) => void;
    sendMessage: (message: string | Buffer) => void;
    sendFileAck: (file: any, type: 'file' | 'image') => void;
    disconnect: () => void;
    setUseTLS: (useTLS: boolean) => void;
}

const TCPContext = createContext<TCPContextType | undefined>(undefined);

export const useTCP = () => {
    const context = useContext(TCPContext);
    if (!context) {
        throw new Error('useTCP must be used within a TCPProvider');
    }
    return context;
}

const options = {
    keystore: require('../../tls_certs/server-keystore.p12'),
}

export const TCPProvider:FC<{ children: React.ReactNode }> = ({ children }) => {

    const [server, setServer] = useState<any>(null);
    const [client, setClient] = useState<any>(null);
    const [connectedDevice, setConnectedDevice] = useState<any>(null);
    const [sentFiles, setSentFiles] = useState<any>([]);
    const [serverSocket, setServerSocket] = useState<any>(null);
    const [receivedFiles, setReceivedFiles] = useState<any>([]);
    const [totalSentBytes, setTotalSentBytes] = useState<number>(0);
    const [totalReceivedBytes, setTotalReceivedBytes] = useState<number>(0);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [useTLS, setUseTLS] = useState<boolean>(false); // Default to false for regular TCP

    const { currentChunkSet, setCurrentChunkSet, setChunkStore, resetChunkStore } = useChunkStore();

    // Utility function to create message buffer handler
    const createMessageHandler = (socket: any, messageProcessor: (parsedData: any) => void) => {
        let messageBuffer = '';

        return async (data: any) => {
            console.log('Socket data received:', data.toString().substring(0, 100) + '...');
            try {
                // Add incoming data to buffer
                messageBuffer += data.toString();
                
                // Try to extract complete JSON messages
                let messageStart = 0;
                let braceCount = 0;
                let inString = false;
                let escapeNext = false;
                
                for (let i = 0; i < messageBuffer.length; i++) {
                    const char = messageBuffer[i];
                    
                    if (escapeNext) {
                        escapeNext = false;
                        continue;
                    }
                    
                    if (char === '\\' && inString) {
                        escapeNext = true;
                        continue;
                    }
                    
                    if (char === '"' && !escapeNext) {
                        inString = !inString;
                        continue;
                    }
                    
                    if (!inString) {
                        if (char === '{') {
                            braceCount++;
                        } else if (char === '}') {
                            braceCount--;
                            
                            // Complete JSON message found
                            if (braceCount === 0) {
                                const completeMessage = messageBuffer.substring(messageStart, i + 1);
                                try {
                                    const parsedData = JSON.parse(completeMessage);
                                    console.log('Processing message:', parsedData.event);
                                    messageProcessor(parsedData);
                                } catch (parseError) {
                                    console.error('Error parsing message:', parseError, 'Message:', completeMessage.substring(0, 100));
                                }
                                messageStart = i + 1;
                            }
                        }
                    }
                }
                
                // Keep remaining incomplete message in buffer
                messageBuffer = messageBuffer.substring(messageStart);
                
            } catch (error) {
                console.error('Error processing socket data:', error);
                // Reset buffer on error
                messageBuffer = '';
            }
        };
    };

    //Start Server
    const disconnect = useCallback(() => {
        if(client) {
            client.destroy();
        }
        if(server) {
            server.close();
        }
        setReceivedFiles([]);
        setSentFiles([]);
        setCurrentChunkSet(null);
        setTotalReceivedBytes(0);
        setChunkStore(null);
        setIsConnected(false);
    }, [client, server]);

    const setupSocketHandlers = (socket: any) => {
        socket.setNoDelay(true);
        socket.setKeepAlive(true, 30000); // Enable keep-alive
        socket.readableHighWaterMark = 1024 * 1024 * 2; // 2MB buffer
        socket.writableHighWaterMark = 1024 * 1024 * 2; // 2MB buffer

        // Create message handler for server socket
        const handleMessage = createMessageHandler(socket, (parsedData: any) => {
            if(parsedData?.event === 'connect') {
                setIsConnected(true);
                setConnectedDevice(parsedData?.deviceName);
            }

            if (parsedData.event === 'file_ack') {
                receiveFileAck(parsedData?.file, socket, setReceivedFiles);
            }

            if (parsedData.event === 'send_chunk_ack') {
                sendChunkAck(parsedData?.chunkNo, socket, setTotalSentBytes, setSentFiles);
            }

            if (parsedData.event === 'receive_chunk_ack') {
                receiveChunkAck(parsedData?.chunk, parsedData?.chunkNo, socket, setTotalReceivedBytes, generateFile);
            }
        });

        socket.on('data', handleMessage);

        socket.on('close', () => {
            console.log('Socket disconnected');
            setReceivedFiles([]);
            setSentFiles([]);
            setTotalSentBytes(0);
            setTotalReceivedBytes(0);
            setCurrentChunkSet(null);
            setIsConnected(false);
            disconnect();
        });

        socket.on('error', (error: any) => {
            console.log('Socket error:', error);
        });
    };

    const startServer = useCallback((port: number, enableTLS: boolean = useTLS) => {
        if (server) {
            console.log('Server already started');
            return;
        }

        if (enableTLS) {
            // Try TLS server first
            const tlsServer = TcpSocket.createTLSServer(options, (socket: any) => {
                console.log('TLS client connected', socket.address());
                setServerSocket(socket);
                setupSocketHandlers(socket);
            });

            tlsServer.listen(port, '0.0.0.0', () => {
                const address = tlsServer.address();
                console.log('TLS server started', address?.address, address?.port);
            });

            tlsServer.on('error', (error: any) => {
                console.log('TLS server error, falling back to regular TCP:', error);
                
                // Start regular TCP server as fallback
                const regularServer = TcpSocket.createServer((socket: any) => {
                    console.log('Regular TCP client connected (fallback)', socket.address());
                    setServerSocket(socket);
                    setupSocketHandlers(socket);
                });

                regularServer.listen(port, '0.0.0.0', () => {
                    const address = regularServer.address();
                    console.log('Regular TCP server started (fallback)', address?.address, address?.port);
                });

                regularServer.on('error', (error: any) => {
                    console.log('Regular TCP server error:', error);
                    Alert.alert('Server Error', 'Failed to start server on port ' + port);
                });

                setServer(regularServer);
            });

            setServer(tlsServer);
        } else {
            // Start regular TCP server directly
            const regularServer = TcpSocket.createServer((socket: any) => {
                console.log('Regular TCP client connected', socket.address());
                setServerSocket(socket);
                setupSocketHandlers(socket);
            });

            regularServer.listen(port, '0.0.0.0', () => {
                const address = regularServer.address();
                console.log('Regular TCP server started', address?.address, address?.port);
            });

            regularServer.on('error', (error: any) => {
                console.log('Regular TCP server error:', error);
                Alert.alert('Server Error', 'Failed to start server on port ' + port);
            });

            setServer(regularServer);
        }
    }, [server, useTLS]);

    //Client start
    const connectToServer = useCallback((host: string, port: number, deviceName: string, enableTLS: boolean = useTLS) => {
        console.log('Attempting to connect to:', host, port, deviceName, enableTLS ? 'with TLS' : 'without TLS');
        
        // Add connection timeout
        const connectionTimeout = setTimeout(() => {
            console.log('Connection timeout - force closing');
            Alert.alert(
                'Connection Timeout',
                'Connection attempt timed out. Please try again.',
                [{ text: 'OK' }]
            );
            setIsConnected(false);
        }, 15000); // 15 second timeout

        const handleConnection = (socket: any, connectionType: string) => {
            console.log(`Successfully connected to server via ${connectionType}`);
            clearTimeout(connectionTimeout);
            setIsConnected(true);
            setConnectedDevice(deviceName);
            
            const myDeviceName = DeviceInfo.getDeviceNameSync();
            socket.write(JSON.stringify({
                event: 'connect',
                deviceName: myDeviceName,
            }));
        };

        const setupClientHandlers = (socket: any) => {
            socket.setNoDelay(true);
            socket.setKeepAlive(true, 30000); // Enable keep-alive
            socket.readableHighWaterMark = 1024 * 1024 * 2; // 2MB buffer
            socket.writableHighWaterMark = 1024 * 1024 * 2; // 2MB buffer

            // Create message handler for client socket
            const handleMessage = createMessageHandler(socket, (parsedData: any) => {
                if (parsedData.event === 'file_ack') {
                    receiveFileAck(parsedData?.file, socket, setReceivedFiles);
                }

                if (parsedData.event === 'send_chunk_ack') {
                    sendChunkAck(parsedData?.chunkNo, socket, setTotalSentBytes, setSentFiles);
                }

                if (parsedData.event === 'receive_chunk_ack') {
                    receiveChunkAck(parsedData?.chunk, parsedData?.chunkNo, socket, setTotalReceivedBytes, generateFile);
                }
            });

            socket.on('data', handleMessage);

            socket.on('close', () => {
                console.log('Client disconnected');
                clearTimeout(connectionTimeout);
                setReceivedFiles([]);
                setSentFiles([]);
                setCurrentChunkSet(null);
                setTotalReceivedBytes(0);
                setChunkStore(null);
                setIsConnected(false);
                disconnect();
            });

            return socket;
        };

        // Function to try regular TCP connection
        const tryRegularTCP = () => {
            console.log('Attempting regular TCP connection...');
            
            const regularClient = TcpSocket.createConnection(
                {
                    host,
                    port,
                },
                () => handleConnection(regularClient, 'Regular TCP')
            );

            setupClientHandlers(regularClient);

            regularClient.on('error', (error: any) => {
                console.log('Regular TCP client error:', error);
                clearTimeout(connectionTimeout);
                
                Alert.alert(
                    'Connection Error',
                    'Failed to connect to device. Please ensure the receiving device is ready.',
                    [{ text: 'OK' }]
                );
                setIsConnected(false);
            });

            setClient(regularClient);
        };

        if (enableTLS) {
            // First try TLS connection
            const tlsClient = TcpSocket.connectTLS(
                {
                    host,
                    port,
                    cert: true,
                    ca: require('../../tls_certs/server-cert.pem'),
                },
                () => handleConnection(tlsClient, 'TLS')
            );

            setupClientHandlers(tlsClient);

            tlsClient.on('error', (error: any) => {
                console.log('TLS client error, trying regular TCP fallback:', error);
                tryRegularTCP();
            });

            setClient(tlsClient);
        } else {
            // Use regular TCP directly
            tryRegularTCP();
        }
    }, [useTLS]);

    const generateFile = async () => {
        const { chunkStore, resetChunkStore } = useChunkStore.getState();

        if(!chunkStore) {
            console.log('no chunk stores or files to process');
            return;
        }

        if (chunkStore?.totalChunks != chunkStore.chunkArray.length) {
            console.log('not all chunks received');
            return;
        }

        try {
            const combinedChunks = Buffer.concat(chunkStore.chunkArray);
            
            // Create better directory structure for received files
            const platformPath = Platform.OS === 'android' ?
                `${RNFS.DownloadDirectoryPath}/FileShare` : `${RNFS.DocumentDirectoryPath}/FileShare`

            // Ensure directory exists
            const directoryExists = await RNFS.exists(platformPath);
            if (!directoryExists) {
                await RNFS.mkdir(platformPath);
            }

            const filePath = `${platformPath}/${chunkStore.name}`;

            await RNFS.writeFile(filePath, combinedChunks?.toString('base64'), 'base64');

            // Update received files state
            setReceivedFiles((prevFiles: any) => 
                produce(prevFiles, (draftFiles: any) => {
                    const fileIndex = draftFiles?.findIndex((f: any) => f.id === chunkStore.id)
                    if (fileIndex !== -1) {
                        draftFiles[fileIndex] = {
                            ...draftFiles[fileIndex],
                            uri: filePath,
                            available: true,
                        }
                    }
                })
            )

            console.log('file generated', filePath);
            
            // Auto-download completed - notify user and attempt to open
            await handleAutoDownload(filePath, chunkStore.name);
            
            resetChunkStore();

        } catch (error) {
            console.error('error generating file', error);
            Alert.alert('Download Failed', 'Failed to save the received file. Please try again.');
        }
    }

    const getMimeType = (fileName: string): string => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        const mimeTypes: { [key: string]: string } = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'txt': 'text/plain',
            'csv': 'text/csv',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'mp4': 'video/mp4',
            'avi': 'video/x-msvideo',
            'mov': 'video/quicktime',
            'wmv': 'video/x-ms-wmv',
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'flac': 'audio/flac',
            'zip': 'application/zip',
            'rar': 'application/x-rar-compressed',
            '7z': 'application/x-7z-compressed',
        };
        return mimeTypes[extension || ''] || 'application/octet-stream';
    };

    const handleAutoDownload = async (filePath: string, fileName: string) => {
        try {
            // For Android, trigger media scan to make file visible in Downloads app
            if (Platform.OS === 'android') {
                try {
                    const mimeType = getMimeType(fileName);
                    await ReactNativeBlobUtil.fs.scanFile([{
                        path: filePath,
                        mime: mimeType
                    }]);
                    console.log('Media scan completed for:', filePath, 'with MIME type:', mimeType);
                } catch (scanError) {
                    console.log('Media scan failed (non-critical):', scanError);
                }
            }

            // Show success notification with auto-open option
            const pathDescription = Platform.OS === 'android' 
                ? 'Downloads/FileShare folder' 
                : 'Documents/FileShare folder';
            
            Alert.alert(
                'Download Complete',
                `"${fileName}" has been successfully downloaded and saved to your ${pathDescription}.`,
                [
                    {
                        text: 'OK',
                        style: 'default'
                    },
                    {
                        text: 'Open File',
                        style: 'default',
                        onPress: () => openDownloadedFile(filePath)
                    }
                ]
            );

        } catch (error) {
            console.error('Auto-download handling failed:', error);
            // Still show success message even if auto-open fails
            Alert.alert('Download Complete', `"${fileName}" has been successfully downloaded.`);
        }
    }

    const openDownloadedFile = async (filePath: string) => {
        try {
            const normalizedPath = Platform.OS === 'ios' ? `file://${filePath}` : filePath;
            
            if (Platform.OS === 'ios') {
                await ReactNativeBlobUtil.ios.openDocument(normalizedPath);
                console.log('File opened successfully on iOS');
            } else {
                await ReactNativeBlobUtil.android.actionViewIntent(normalizedPath, '*/*');
                console.log('File opened successfully on Android');
            }
        } catch (error) {
            console.error('Error opening file:', error);
            const pathDescription = Platform.OS === 'android' 
                ? 'Downloads/FileShare folder' 
                : 'Documents/FileShare folder';
            Alert.alert(
                'Unable to Open File',
                `The file was downloaded successfully, but we couldn't open it automatically. You can find it in your ${pathDescription}.`
            );
        }
    }

    const sendMessage = useCallback((message: string | Buffer) => {
        const socket = client || serverSocket;
        if(socket) {
            try {
                socket.write(JSON.stringify(message));
                console.log('message sent:', message);
            } catch (error) {
                console.error('error sending message:', error);
            }
        } else {
            console.error('no socket available to send message');
        }
    }, [client, serverSocket]);
    
    //Send file ack
    const sendFileAck = async(file: any, type:'image' | 'file') => {
        if (currentChunkSet != null) {
            Alert.alert('Wait for current file to be sent')
            return;
        }

        const normalisedPath = 
            Platform.OS == 'ios' ? file?.uri?.replace('file://', '') : file?.uri;
        
        try {
            const fileData = await RNFS.readFile(normalisedPath, 'base64');
            const buffer = Buffer.from(fileData, 'base64');
            const CHUNK_SIZE = 1024 * 64; // 8KB chunks

            let totalChunks = 0;
            let offset = 0;
            let chunkArray: any[] = [];

            while (offset < buffer.length) {
                const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
                totalChunks++;
                chunkArray.push(chunk);
                offset += chunk.length;
            }

            const rawData = {
                id: uuidv4(),
                name: type === 'file' ? file?.name : file?.fileName,
                size: type === 'file' ? file?.size : file?.fileSize,
                mimeType: type === 'file' ? 'file' : '.jpg',
                totalChunks
            }

            setCurrentChunkSet({
                id: rawData.id,
                chunkArray,
                totalChunks
            })

            setSentFiles((prevData: any) => 
                produce(prevData, (draftData: any) => {
                    draftData.push({
                        ...rawData,
                        uri: file?.uri,
                    });
                })
            )

            const socket = client || serverSocket;

            if(!socket) {
                console.error('no socket available to send file');
                return;
            }

            console.log('File Acknowledged, sending...', rawData.name)  
            socket.write(JSON.stringify({event: 'file_ack', file: rawData}))
        } catch (error) {
            console.error('error sending file:', error);
            Alert.alert('Error', 'Failed to send file. Please try again.');
        }
    }

    return (
        <TCPContext.Provider 
            value={{
                server,
                client,
                connectedDevice,
                sentFiles,
                receivedFiles,
                totalSentBytes,
                totalReceivedBytes,
                isConnected,
                useTLS,
                startServer,
                connectToServer,
                disconnect,
                sendMessage,
                sendFileAck,
                setUseTLS,
            }}>
            {children}
        </TCPContext.Provider>
    )
}