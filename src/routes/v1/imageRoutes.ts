import { Router } from 'express';
import path from 'path';
const router: Router = Router();

const uploadDir = path.resolve(__dirname, "../../../../uploads/images");

router.get("/:filename", (req, res) => {
    const { filename } = req.params;

    const filePath = path.join(uploadDir, filename);

    if (!filePath.startsWith(uploadDir)) {
        res.status(403).send("Access denied.");
        return
    }

    res.sendFile(filePath, (err) => {
        if (err) {
            console.error(err);
            res.status(404).send("File not found.");
        }
    });
});


export default router;