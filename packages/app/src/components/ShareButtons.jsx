import React, { useState, showDialog, useCallback } from "react";
import PropTypes from "prop-types";
import { Pane, MoreIcon, CornerDialog, Button } from "evergreen-ui";
import {
	FacebookShareButton,
	RedditShareButton,
	TwitterShareButton,
	VKShareButton,
	WeiboShareButton,
	EmailShareButton
} from "react-share";

const shareMessage = "Check out what's happening in Web3!";

const ShareButtons = ({ link }) => {
	const [isDialogShown, setDialogShown] = useState(false);

	const showDialog = useCallback(() => {
		setDialogShown(true);
	}, []);
	const hideDialog = useCallback(() => {
		setDialogShown(false);
	}, []);

	return (
		<>
			<Pane>
				<Pane marginX={6}>
					<TwitterShareButton
						url={link}
						title={shareMessage}
						hashtags={["Web3", "Usher"]}
					/>
				</Pane>
				<Pane marginX={6}>
					<FacebookShareButton
						url={link}
						quote={shareMessage}
						hashtags={["Web3", "Usher"]}
					/>
				</Pane>
				<Pane marginX={6}>
					<RedditShareButton url={link} title={shareMessage} />
				</Pane>
				<Pane marginX={6}>
					<VKShareButton url={link} title={shareMessage} />
				</Pane>
				<Pane marginX={6}>
					<WeiboShareButton url={link} title={shareMessage} />
				</Pane>
				<Pane marginX={6}>
					<Button borderRadius={100} onClick={showDialog}>
						<MoreIcon />
					</Button>
				</Pane>
			</Pane>
			{/* <CornerDialog
				title="Share your Affiliate Link"
				isShown={isDialogShown}
				onCloseComplete={hideDialog}
			></CornerDialog> */}
		</>
	);
};

ShareButtons.propTypes = {
	link: PropTypes.string.isRequired
};

export default ShareButtons;
