// eslint-disable-next-line import/no-extraneous-dependencies
import favicons from "favicons";
// eslint-disable-next-line import/no-extraneous-dependencies
import prettier from "prettier";
import fs from "fs/promises";
import path from "path";
import configuration from "../favicons-config";

/*
 * This script generates a React component to import favicons into your project.
 * and also generates all necessary files for the favicons based on the configuration.
 */
const projectRootPath = path.resolve(__dirname, "../../../");
const { sourceIconPath } = configuration; // Icon source file path.
const publicDir = path.resolve(projectRootPath, "public"); // Public directory path.
const generatedDirOnPublic = path.join(publicDir, "static/generated"); // Output directory path.
const filesDir = path.join(generatedDirOnPublic, "files");

// this one will go to src/ folder
const generatedDirOnSrc = path.resolve(
	projectRootPath,
	"src/utils/generated-favicons/"
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
	const response = await favicons(sourceIconPath, {
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

	const faviconsTags = response.html.map(fixUnclosedAutoclosedTags).join("\n");
	const faviconsContent = await fillFaviconsTemplate(faviconsTags).then(format);

	await fs.writeFile(generatedTagsComponentPath, faviconsContent);
};

// Replace $DIR$ in the source file

const scriptPath = path.relative(process.cwd(), __filename);

/**
 * Better to reformat our code with prettier so it will keep consistent
 */
const format = async (contents: string) => {
	const options = await prettier.resolveConfig(scriptPath);
	return prettier.format(contents, options ?? undefined);
};

const main = async () => {
	await deleteOldFilesIfExists();
	await generateFavicons();
};
main().then(() => console.log(scriptPath, "Done!"));
