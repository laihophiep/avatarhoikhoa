// Đặt trong thẻ <script> của file HTML hoặc một file .js riêng
document.addEventListener('DOMContentLoaded', () => {
    const baguaImage = document.getElementById('bagua-image');
    const currentHeadingDisplay = document.getElementById('current-heading');
    const permissionButton = document.getElementById('permission-button');

    let currentHeading = 0; // Hướng hiện tại của thiết bị

    // Hàm xử lý khi có dữ liệu hướng thiết bị
    function handleDeviceOrientation(event) {
        // alpha: Hướng Đông-Tây (compass heading)
        // Đây là giá trị quan trọng nhất cho la bàn
        if (event.webkitCompassHeading !== undefined) {
            // Dành cho Safari trên iOS (giá trị la bàn từ 0-360 độ Bắc)
            currentHeading = event.webkitCompassHeading;
        } else if (event.alpha !== null) {
            // Dành cho các trình duyệt khác (giá trị từ 0-360 độ)
            // Cần hiệu chỉnh lại để 0 độ là Bắc.
            // event.alpha là hướng so với trục Z, giá trị thay đổi khi thiết bị xoay
            // Có thể cần thêm beta, gamma để tính toán chính xác hơn tùy trường hợp
            currentHeading = 360 - event.alpha; // Đảo ngược để 0 độ là Bắc và tăng theo chiều kim đồng hồ
        }

        // Cập nhật hiển thị hướng
        currentHeadingDisplay.textContent = `${currentHeading.toFixed(1)}°`;

        // Xoay hình ảnh Bát Trạch
        // Hình ảnh cần xoay ngược lại với hướng của thiết bị
        // Nếu điện thoại quay 30 độ về Đông, hình ảnh cần xoay -30 độ để "cố định" Bắc
        baguaImage.style.transform = `rotate(${-currentHeading}deg)`;
    }

    // Hàm yêu cầu quyền truy cập cảm biến (chỉ cho iOS 13+ và Safari)
    function requestDeviceOrientationPermission() {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', handleDeviceOrientation);
                        permissionButton.style.display = 'none'; // Ẩn nút sau khi cấp quyền
                    } else {
                        currentHeadingDisplay.textContent = 'Không được cấp quyền la bàn.';
                        alert('Bạn cần cấp quyền truy cập la bàn để sử dụng tính năng này.');
                    }
                })
                .catch(console.error);
        } else {
            // Các trình duyệt khác không cần yêu cầu quyền rõ ràng
            window.addEventListener('deviceorientation', handleDeviceOrientation);
            permissionButton.style.display = 'none'; // Ẩn nút nếu không cần quyền
        }
    }

    // Gắn sự kiện click cho nút yêu cầu quyền
    permissionButton.addEventListener('click', requestDeviceOrientationPermission);

    // Thử khởi động ngay nếu không phải iOS 13+ hoặc quyền đã được cấp trước đó
    if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
        window.addEventListener('deviceorientation', handleDeviceOrientation);
        permissionButton.style.display = 'none';
    }
});
