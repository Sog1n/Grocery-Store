import uploadImageClodinary from "../utils/uploadImageClodinary.js"
import { metrics } from "../middleware/prometheus.middleware.js"

const uploadImageController = async(request,response)=>{
    try {
        const file = request.file

        const uploadImage = await uploadImageClodinary(file)

        // 📊 Track metrics
        metrics.recordFileUpload('product_image', 'success');

        return response.json({
            message : "Upload done",
            data : uploadImage,
            success : true,
            error : false
        })
    } catch (error) {
        // 📊 Track failed upload
        metrics.recordFileUpload('product_image', 'failed');

        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export default uploadImageController
