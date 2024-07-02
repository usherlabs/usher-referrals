import React from "react";
import clsx from "clsx";

interface DemoCardProps {
	className?: string;
	imgSrcOrNode?: string | ReactNode; // Change imgSrc to imgSrcOrNode and accept both string and ReactNode
	altText: string;
	title: string;
	description: string;
	ctaLink: string;
	ctaText?: string;
}

const DemoCard: React.FC<DemoCardProps> = ({
	className,
	imgSrcOrNode,
	altText,
	title,
	description,
	ctaLink,
	ctaText
}) => {
	const cardContent = (
		<>
			{!!imgSrcOrNode ? (
				typeof imgSrcOrNode === "string" ? (
					<img src={imgSrcOrNode} alt={altText} width="48" height="48" />
				) : (
					<div style={{ width: "48px", height: "48px" }}>{imgSrcOrNode}</div>
				)
			) : null}
			<h3 className="my-3" style={{ color: "var(--ifm-heading-color)" }}>
				{title}
			</h3>
			<p style={{ color: "var(--ifm-font-color-base)" }}>{description}</p>
		</>
	);
	return (
		<div
			className={clsx(
				"rounded-lg p-6 border transition-all",
				{
					"cursor-pointer": !ctaText,
					"hover:shadow": !ctaText,
					"hover:opacity-90": !ctaText
				},
				className
			)}
			style={{
				backgroundColor: "var(--ifm-background-surface-color)",
				borderColor: "var(--ifm-table-border-color)"
			}}
		>
			{cardContent}
			{ctaText ? (
				<a
					href={ctaLink}
					target="_blank"
					rel="noopener noreferrer"
					className="text-primary inline-flex items-center space-x-1 hover:underline"
					style={{ transition: "color 0.3s" }}
				>
					<span>{ctaText}</span>
					<span>→</span>
				</a>
			) : null}
		</div>
	);
};

export default DemoCard;
