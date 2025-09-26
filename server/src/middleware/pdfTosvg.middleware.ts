import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { Request, Response, NextFunction } from "express";

interface CustomFile extends Express.Multer.File {
    destination: string;
    filename: string;
    mimetype: string;
    path: string;
}

function convertPDFtoSVG(inputPdfPath: string, outputSvgPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const input = path.resolve(inputPdfPath);
        const output = path.resolve(outputSvgPath);
        const command = `inkscape "${input}" --export-type=svg --export-plain-svg --export-filename="${output}"`;

        exec(command, (error: Error | null, stdout: string, stderr: string) => {
            if (error) {
                console.error("Error during conversion:", error);
                return reject(error);
            }
            if (stderr) {
                console.error("Inkscape stderr:", stderr);
            }
            console.log("Conversion successful:", stdout);

            // After successful conversion, delete the original PDF file
            fs.unlink(input, (err: NodeJS.ErrnoException | null) => {
                if (err) {
                    console.error("Error deleting original PDF file:", err);
                    return reject(err);
                }
                console.log("Original PDF file deleted successfully");
                resolve();
            });
        });
    });
}

export const handlePDFtoSVG = (req: Request, res: Response, next: NextFunction) => {
    const files: CustomFile[] = (req.files as CustomFile[]) || [req.file as CustomFile];
    const conversionPromises = files.map(async (file: CustomFile) => {
        const filePath = path.join(file.destination, file.filename);
        const svgFilePath = path.join(file.destination, `${path.parse(file.filename).name}.svg`);

        if (file.mimetype === 'application/pdf') {
            return convertPDFtoSVG(filePath, svgFilePath)
                .then(() => {
                    // Update the request file to point to the new SVG file
                    file.path = svgFilePath;
                    file.mimetype = 'image/svg+xml';
                })
                .catch((err: Error) => {
                    console.error("Conversion failed:", err);
                    throw new Error('Failed to convert PDF to SVG');
                });
        } else {
            return Promise.resolve();
        }
    });

    Promise.all(conversionPromises)
        .then(() => next())
        .catch((err: Error) => {
            res.status(500).json({ message: err.message });
        });
};