import React from "react";
import { Link } from "react-router-dom";
import { Sun } from "lucide-react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/ui/card";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <Sun className="w-6 h-6" />
          </div>
          <span className="text-lg font-bold text-stone-900">Hoa Hướng Dương</span>
        </Link>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border border-border/80 shadow-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Cổng Đăng Nhập & Học Tập</CardTitle>
            <CardDescription>
              Vào khu vườn cảm xúc và kế hoạch học tập cá nhân hóa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                <TabsTrigger value="register">Đăng ký học sinh</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
