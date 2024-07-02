import React from 'react'

type Props = {
	/// expected url: https://www.loom.com/embed/<id>
	src: string;
	hideOwner?: boolean;
	hideTitle?: boolean;
	hideShare?: boolean;
	hideEmbed?: boolean;
};
const LoomVideo = (props: Props) => {
	const { src, hideOwner, hideTitle, hideShare, hideEmbed } = props;

	const optionsMapping = {
		"hide_owner": hideOwner,
		"hide_title": hideTitle,
		"hide_share": hideShare,
		"hideEmbedTopBar": hideEmbed
	};

	const options = Object.entries(optionsMapping)
		.filter(([key, value]) => value)
		.map(([key, value]) => `${key}=${value}`)
		.join("&");
	const url = `${src}?${options}`;

	return (
		<div
			style={{
				position: "relative",
				paddingBottom: "56.25%",
				height: 0
			}}
		>
			<iframe
				src={url}
				frameBorder={0}
				allowFullScreen
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%"
				}}
			></iframe>
		</div>
	);
};

export default LoomVideo