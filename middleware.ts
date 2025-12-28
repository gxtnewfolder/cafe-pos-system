import { withAuth } from "next-auth/middleware";

export default withAuth({
  // กำหนดหน้า Login ให้ชัดเจน
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // ระบุ Path ที่ต้องการป้องกัน
  // หมายความว่า: หน้าแรก (/), Dashboard, และ API ที่สำคัญ ต้อง Login ก่อน
  matcher: [
    "/",
    "/dashboard/:path*",
    "/api/dashboard/:path*",
    "/api/settings/:path*",
    "/api/customers/:path*",
    "/api/upload/:path*",
  ],
};
