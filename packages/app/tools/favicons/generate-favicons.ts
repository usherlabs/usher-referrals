import favicons from "favicons";
import fs from "fs/promises";
import path from "path";
import configuration from "./favicons-config";

/*
 * This script generates a React component to import favicons into your project.
 * and also generates all necessary files for the favicons based on the configuration.
 */

const sourceImagePath = path.join(__dirname, "./source-icon.svg"); // Icon source file path.
const publicDir = path.resolve(__dirname, "../../public"); // Public directory path.
const generatedDirOnPublic = path.join(publicDir, "static/generated"); // Output directory path.
const filesDir = path.join(generatedDirOnPublic, "files");

// this one will go to src/ folder
const generatedDirOnSrc = path.resolve(
	__dirname,
	"../../src/utils/generated-favicons/"
);
const generatedTagsComponentPath = path.join(
	generatedDirOnSrc,
	"FaviconTags.tsx"
);
const templatePath = path.resolve(__dirname, "./FaviconTags.tsx");

const fillFaviconsTemplate = async (faviconsContent: string) => {
	const template = await fs.readFile(templatePath, "utf-8");
	const newTemplate = template.replace("$FAVICONS$", faviconsContent);
	return newTemplate;
};

const fixUnclosedAutoclosedTags = (contents: string) => {
	const autoClosedTags = ["link", "meta"];
	const regex = new RegExp(`<((${autoClosedTags.join("|")}).*)>$`, "g");

	return contents.replaceAll(regex, `<$1 />`);
};

const filesRelativeToPublic = path.relative(publicDir, filesDir);

// Configuration (see above in the README file).

const deleteFilesIfExists = async (dirOrFile: string) => {
	try {
		await fs.access(dirOrFile);
		console.log("Deleting directory", dirOrFile);
		await fs.rm(dirOrFile, { recursive: true, force: true });
	} catch (err: any) {
		if ("code" in err && err.code !== "ENOENT") {
			throw err;
		}
	}
};

const deleteOldFilesIfExists = async () => {
	await deleteFilesIfExists(generatedDirOnPublic);
	await deleteFilesIfExists(generatedDirOnSrc);
};

const generateFavicons = async () => {
	console.log("Generating favicons...");
	const response = await favicons(sourceImagePath, {
		...configuration,
		path: filesRelativeToPublic
	});

	console.log("Writing favicons...");
	await fs.mkdir(filesDir, { recursive: true });
	await fs.mkdir(generatedDirOnSrc, { recursive: true });

	await Promise.all(
		response.images.map(async (image) =>
			fs.writeFile(path.join(filesDir, image.name), image.contents)
		)
	);
	await Promise.all(
		response.files.map(async (file) =>
			fs.writeFile(path.join(filesDir, file.name), file.contents)
		)
	);

	const faviconsContent = await fillFaviconsTemplate(
		await response.html.map(fixUnclosedAutoclosedTags).join("\n")
	);
	await fs.writeFile(generatedTagsComponentPath, faviconsContent);
};

// Replace $DIR$ in the source file

const scriptPath = path.relative(process.cwd(), __filename);

const main = async () => {
	await deleteOldFilesIfExists();
	await generateFavicons();
};
main().then(() => console.log(scriptPath, "Done!"));
