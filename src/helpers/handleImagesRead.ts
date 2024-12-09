import fs from 'fs/promises';

export const handleImagesRead = async (imagePath: string) => {
    try {
        await fs.access(imagePath);

        const imageBuffer = await fs.readFile(imagePath);
        const base64Image = imageBuffer.toString('base64');
        return base64Image;
    } catch (err) {
        return undefined;
    }
}