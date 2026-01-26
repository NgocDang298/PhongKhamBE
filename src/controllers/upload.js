module.exports = {
    /**
     * Upload một hoặc nhiều file lên Cloudinary
     * Trả về danh sách URL của các file đã upload
     */
    async uploadFiles(req, res) {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                status: false,
                message: 'Vui lòng chọn ít nhất một file để upload'
            });
        }

        const urls = req.files.map(file => file.path);

        return res.json({
            status: true,
            message: 'Upload file thành công',
            data: {
                urls: urls
            }
        });
    }
};
