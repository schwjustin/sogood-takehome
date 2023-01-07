import { useState, useEffect, useRef } from "react";

import AgoraRTC, {
	IAgoraRTCRemoteUser,
	IMicrophoneAudioTrack,
	ICameraVideoTrack,
	ClientConfig,
} from "agora-rtc-sdk-ng";
import { createClient } from "agora-rtc-react";

interface UseAgora {
	start: boolean;
	videoTrack: ICameraVideoTrack | null;
	join: () => {};
	leave: () => {};
}

const useAgora = (role: "HOST" | "AUDIENCE"): any[] => {
	const channel = "OjG7LQbxUG";
	const appId: string = "adce12b9bde94689bf67b8bd71b5a8d1";
	const token: string | null =
		"006adce12b9bde94689bf67b8bd71b5a8d1IAC8PO1/faxFsCpGpHIrxAFlpCjcwvsD+44TxnXJ7YsfoGc4upIAAAAAEACd52wUzSK2YwEAAQDNIrZj";

	const config: ClientConfig = {
		mode: "live",
		codec: "vp8",
	};

	const useClient = createClient(config);
	const client = useClient();

	const [videoTrack, setVideoTrack] = useState<ICameraVideoTrack | null>(null);
	const [audioTrack, setAudioTrack] = useState<IMicrophoneAudioTrack | null>(
		null
	);

	const [start, setStart] = useState(false);
	const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);

	useEffect(() => { }, [client, start, videoTrack]);

	const init = async () => {
		client.on("user-published", async (user, mediaType) => {
			await client.subscribe(user, mediaType);

			console.log("subscribe success");

			if (mediaType === "video") {
				setUsers((prevUsers) => {
					return [...prevUsers, user];
				});
			}
			if (mediaType === "audio") {
				user.audioTrack?.play();
			}
		});

		client.on("user-unpublished", (user, type) => {
			console.log("unpublished", user, type);

			if (type === "audio") {
				user.audioTrack?.stop();
			}
			if (type === "video") {
				setUsers((prevUsers) => {
					return prevUsers.filter((User) => User.uid !== user.uid);
				});
			}
		});

		client.on("user-left", (user) => {
			console.log("leaving", user);

			setUsers((prevUsers) => {
				return prevUsers.filter((User) => User.uid !== user.uid);
			});
		});
	};

	const join = async () => {
		console.log("hello");

		setStart(true);

		// if (role === "HOST") {
		console.log("host");

		// const audio = await AgoraRTC.createMicrophoneAudioTrack();
		// setAudioTrack(audio);

		const video = await AgoraRTC.createCameraVideoTrack();
		setVideoTrack(video);

		await init();
		await client.join(appId, channel, token, null);
		if (audioTrack && videoTrack)
			await client.publish([audioTrack, videoTrack]);
		// } else {
		// 	await init();
		// 	await client.join(appId, channel, token, null);
		// 	console.log("hi");

		// 	console.log(client.localTracks);

		// }

	};

	const leave = async () => {
		await client.leave();
		client.removeAllListeners();
		audioTrack?.close();
		videoTrack?.close();
		setStart(false);
	};

	return [start, videoTrack, join, leave, users];
};

export default useAgora;
