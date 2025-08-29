document.addEventListener('DOMContentLoaded', () => {
    // Các thành phần UI
    const uploadBtn = document.getElementById('upload-btn');
    const zoomSlider = document.getElementById('zoom-slider');
    const downloadBtn = document.getElementById('download-btn');
    const container = document.getElementById('canvas-container');
    const colorPicker = document.getElementById('color-picker');
    const fanpageAvatarPreview = document.getElementById('fanpage-avatar-preview');

    const width = container.clientWidth;
    const height = container.clientHeight;

    // --- Khởi tạo Konva Stage ---
    const stage = new Konva.Stage({
        container: 'canvas-container',
        width: width,
        height: height,
    });

    const backgroundLayer = new Konva.Layer();
    const userImageLayer = new Konva.Layer();
    const frameLayer = new Konva.Layer();
    // Thứ tự thêm layer rất quan trọng: nền -> ảnh -> khung
    stage.add(backgroundLayer, userImageLayer, frameLayer);

    let userImage = null;

    // --- Tạo lớp nền màu và hiển thị nó ngay từ đầu ---
    const backgroundRect = new Konva.Rect({
        x: 0,
        y: 0,
        width: width,
        height: height,
        fill: colorPicker.value, // Lấy màu mặc định từ color picker
    });
    backgroundLayer.add(backgroundRect);
    stage.draw();

    // Hàm cập nhật bản xem trước
    function updatePreview() {
        // Sử dụng setTimeout để đảm bảo canvas đã vẽ xong trước khi lấy dữ liệu
        setTimeout(() => {
            const previewDataURL = stage.toDataURL({
                width: 60,
                height: 60,
                pixelRatio: 2,
            });
            fanpageAvatarPreview.style.backgroundImage = `url(${previewDataURL})`;
        }, 50); 
    }

    // --- Xử lý chọn màu ---
    colorPicker.addEventListener('input', (e) => {
        backgroundRect.fill(e.target.value);
        updatePreview();
    });

    // --- Xử lý tải ảnh người dùng lên ---
    uploadBtn.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = () => {
            Konva.Image.fromURL(reader.result, (img) => {
                userImageLayer.destroyChildren();
                userImage = img;
                userImage.setAttrs({
                    x: width / 2,
                    y: height / 2,
                    draggable: true,
                });

                const aspectRatio = userImage.width() / userImage.height();
                let newWidth, newHeight;
                if (aspectRatio > 1) {
                    newHeight = height;
                    newWidth = height * aspectRatio;
                } else {
                    newWidth = width;
                    newHeight = width / aspectRatio;
                }
                userImage.width(newWidth);
                userImage.height(newHeight);
                userImage.offsetX(userImage.width() / 2);
                userImage.offsetY(userImage.height() / 2);

                userImageLayer.add(userImage);
                zoomSlider.disabled = false;
                downloadBtn.disabled = false;
                updatePreview();
            });
        };
        reader.readAsDataURL(file);
    });

    // --- Xử lý thanh trượt phóng to/thu nhỏ ---
    zoomSlider.addEventListener('input', (e) => {
        if (!userImage) return;
        const scale = parseFloat(e.target.value);
        userImage.scale({ x: scale, y: scale });
        updatePreview();
    });

    // --- Tải và hiển thị ảnh khung ---
    Konva.Image.fromURL('./images/frame.png', (frameImg) => {
        frameImg.setAttrs({
            width: width,
            height: height,
            listening: false,
        });
        frameLayer.add(frameImg);
        updatePreview(); // Cập nhật lại preview sau khi khung đã tải xong
    });

    // --- Xử lý tải ảnh đã ghép về ---
    downloadBtn.addEventListener('click', () => {
        const dataURL = stage.toDataURL({
            pixelRatio: 3,
            mimeType: 'image/png',
        });

        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'avatar-facebook.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});