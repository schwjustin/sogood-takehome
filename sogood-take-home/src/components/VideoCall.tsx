import useAgora from "../utils/useAgora";

import { AgoraVideoPlayer } from "agora-rtc-react";
import { useEffect, useState, useRef } from "react";

import { PlayCircleIcon, StopCircleIcon } from "@heroicons/react/24/solid";

const Product = ({ props, handleOffer, handleBuy, i }) => {
	const [offer, setOffer] = useState("");
	const [offerActive, setOfferActive] = useState(false);

	const inputRef = useRef(null);
	const [inputError, setInputError] = useState(false);

	const handleSubmit = () => {
		if (parseFloat(offer) <= props.price) {
			handleOffer(offer, i);
			setOffer("");
			setOfferActive(false);
		} else {
			setInputError(true);
			// @ts-ignore
			inputRef.current.classList.remove("shake");
			setTimeout(() => {
				// @ts-ignore
				inputRef.current.classList.add("shake");
			}, 100);
		}
	};

	return (
		<div className="space-x-5 flex ">
			<img
				src={props.img}
				className="w-24 rounded-2xl h-24 object-cover object-center flex-shrink-0"
			/>
			<div className="space-y-4 w-full">
				<h1 className="font-semibold">{props.name}</h1>
				{!offerActive ? (
					<div className="flex space-x-4">
						<div
							className="w-1/2 h-10 leading-10 text-center bg-slate-800 rounded-2xl cursor-pointer"
							onClick={() => {
								handleBuy(i);
							}}
						>
							{"BUY $" + props.price.toFixed(2)}
						</div>

						<div
							className="w-1/2 h-10 leading-10 text-center bg-slate-800 rounded-2xl cursor-pointer"
							onClick={() => {
								setOfferActive(true);
							}}
						>
							Offer
						</div>
					</div>
				) : (
					<div className="flex space-x-5">
						<div className="w-full h-[40px] space-y-2">
							<input
								style={{
									boxShadow: inputError
										? "#E54545 0 0 0 1px inset"
										: "rgb(30, 41, 59) 0 0 0 1px inset",
								}}
								className="w-full bg-transparent rounded-2xl pl-4 h-full"
								value={offer}
								ref={inputRef}
								onKeyUp={(e) => {
									if (
										e.key === "Enter" ||
										e.key === "Go" ||
										e.key === "Search" ||
										e.key === "Submit"
									) {
										handleSubmit();
									}
								}}
								onChange={(e) => {
									setOffer(e.target.value);
								}}
							/>
							{inputError && (
								<p
									style={{
										color: "#E54545",
										fontSize: "14px",
										lineHeight: "1.2em",
									}}
								>
									Offer must be less than the listed price
								</p>
							)}
						</div>

						<div
							className="h-10 px-6 leading-10 text-center bg-slate-800 rounded-2xl cursor-pointer"
							onClick={() => {
								handleSubmit();
							}}
						>
							Submit
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

const VideoCall = () => {
	const [start, videoTrack, join, leave, users] = useAgora("HOST");
	const [startA, videoTrackA, joinA, leaveA, usersA] = useAgora("AUDIENCE");

	const [products, setProducts] = useState([
		{
			name: "Megadeth 1987 Peace Sells Vintage T-Shirt",
			price: 280,
			img: "https://process.fs.grailed.com/AJdAgnqCST4iPtnUxiGtTz/auto_image/cache=expiry:max/rotate=deg:exif/resize=height:1400/output=quality:50/compress/jKaVI8tQ8GkbNb5OMcmZ",
			sold: false,
			soldPrice: 0,
			offers: [],
		},
	]);

	useEffect(() => {
		// console.log("video effect");
	}, [start, videoTrack, products]);

	const handleBuy = (i) => {
		const arr = [...products];
		arr[i].sold = true;
		arr[i].soldPrice = arr[i].price;
		setProducts(arr);
	};

	const handleOffer = (offer, i) => {
		const arr = [...products];
		// @ts-ignore
		arr[i].offers.push({ offer: offer, expired: false });

		setProducts(arr);

		setTimeout(() => {
			const arr = [...products];
			arr[i].offers.shift();
			setProducts(arr);
		}, 60000);
	};

	return (
		<div className="pt-[200px]">
			<div className=" max-w-[1000px] mx-auto">
				<div className="flex space-x-[40px]">
					<div className="space-y-5">
						<div className="overflow-hidden rounded-2xl w-[480px] h-[320px] relative bg-slate-800">
							{start && videoTrack ? (
								<>
									<AgoraVideoPlayer
										className="absolute top-0 left-0 w-full h-full"
										videoTrack={videoTrack}
										config={{ fit: "cover" }}
									/>
								</>
							) : null}

							<div className="flex space-x-3 absolute bottom-2 left-2">
								{!start && (
									<PlayCircleIcon
										className="w-8 h-8 cursor-pointer"
										onClick={() => {
											join();
											joinA();
										}}
									/>
								)}

								{start && (
									<StopCircleIcon
										className="w-8 h-8 cursor-pointer"
										onClick={() => {
											leave();
											leaveA();
										}}
									/>
								)}
							</div>
						</div>
						{start && products && products.length > 0
							? products.map((item, i) => (
									<div className="space-x-5 flex">
										<img
											src={item.img}
											className="w-24 rounded-2xl h-24 object-cover object-center flex-shrink-0"
										/>
										<div className="space-y-4 w-full">
											<h1 className="font-semibold">{item.name}</h1>
											{item.sold ? (
												<h1 className="font-semibold">
													{"SOLD $" + item.soldPrice.toFixed(2)}
												</h1>
											) : null}
											{item.offers.length > 0 && !item.sold
												? item.offers.map((offerItem, j) => (
														<>
															{
																// @ts-ignore
																!offerItem.expired && (
																	<div
																		className="space-y-4 p-4 rounded-2xl"
																		style={{
																			boxShadow:
																				"rgb(30, 41, 59) 0 0 0 1px inset",
																		}}
																	>
																		<div>
																			{"$" +
																				// @ts-ignore
																				parseFloat(offerItem.offer).toFixed(2)}
																		</div>
																		<div className="flex space-x-4">
																			<div
																				className="w-1/2 h-10 leading-10 text-center bg-slate-800 rounded-2xl cursor-pointer"
																				onClick={() => {
																					const arr = [...products];
																					arr[i].sold = true;
																					arr[i].soldPrice = parseFloat(
																						// @ts-ignore
																						offerItem.offer
																					);
																					setProducts(arr);
																				}}
																			>
																				Accept
																			</div>

																			<div
																				className="w-1/2 h-10 leading-10 text-center bg-slate-800 rounded-2xl cursor-pointer"
																				onClick={() => {
																					const arr = [...products];
																					// @ts-ignore
																					arr[i].offers[j].expired = true;
																					setProducts(arr);
																				}}
																			>
																				Decline
																			</div>
																		</div>
																		<div className="rounded-full w-full h-1 bg-blue-600 timeout"></div>
																	</div>
																)
															}
														</>
												  ))
												: null}
										</div>
									</div>
							  ))
							: null}
					</div>

					<div className="space-y-5">
						<div className="overflow-hidden rounded-2xl w-[480px] h-[320px] relative bg-slate-800">
							{startA && videoTrackA ? (
								<>
									<AgoraVideoPlayer
										className="absolute top-0 left-0 w-full h-full"
										videoTrack={videoTrackA}
										config={{ fit: "cover" }}
									/>
								</>
							) : null}
						</div>
						{start && products && products.length > 0
							? products.map((item, i) => (
									<>
										{!item.sold ? (
											<Product
												props={item}
												i={i}
												handleOffer={handleOffer}
												handleBuy={handleBuy}
												key={i}
											/>
										) : null}
									</>
							  ))
							: null}
					</div>
				</div>
			</div>
		</div>
	);
};

export default VideoCall;
