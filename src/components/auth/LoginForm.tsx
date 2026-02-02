"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { login } from "@/lib/actions";

const loginSchema = z.object({
  username: z.string().min(1, "账号不能为空"),
  password: z.string().min(1, "密码不能为空"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);

    try {
      const result = await login(formData);

      if (result?.error) {
        // form.setError("root", { message: result.error }); // Optional: keep form error if you want text below input
        toast.error(result.error, {
          duration: 1500,
          style: {
            background: '#000',
            color: '#fff',
            border: 'none'
          }
        });
      } else {
        toast.success("登录成功", {
          duration: 1000,
          position: "top-center",
          style: {
            background: '#000',
            color: '#fff',
            border: 'none'
          }
        });

        setTimeout(() => {
          // Force reload to update session state
          window.location.href = "/space";
        }, 1000);
      }
    } catch (error) {
      toast.error("登录发生错误，请重试");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-gray-900">用户登录</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>账号</FormLabel>
                <FormControl>
                  <Input placeholder="请输入账号" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>密码</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="请输入密码" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {form.formState.errors.root && (
            <div className="text-sm font-medium text-destructive text-center">
              {form.formState.errors.root.message}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "登录中..." : "登录"}
          </Button>

          <div className="text-center text-sm text-gray-600">
            还没有账号？
            <Link href="/register" className="text-indigo-600 hover:underline ml-1">
              去注册
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
