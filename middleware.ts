import { withAuth } from "next-auth/middleware";

export default withAuth({
  // กำหนดหน้า Login ให้ชัดเจน
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // ระบุ Path ที่ต้องการป้องกัน
  // หมายความว่า: หน้าแรก (/) และหน้า Dashboard ทั้งหมด ต้อง Login ก่อน
  matcher: ["/", "/dashboard/:path*"],
};