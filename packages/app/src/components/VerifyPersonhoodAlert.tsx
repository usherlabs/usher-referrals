import React from "react";
import { Alert, Paragraph, Button, Strong, majorScale } from "evergreen-ui";

const VerifyPersonhoodAlert = () => {
	return (
		<Alert intent="warning" title="Unlock Claims">
			<Paragraph marginBottom={12}>
				Verify your personhood to unlock the ability to submit claims.
			</Paragraph>
			<Button height={majorScale(4)}>
				<Strong>Verify your personhood</Strong>
			</Button>
		</Alert>
	);
};

export default VerifyPersonhoodAlert;
