import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/contexts/auth";
import ReCAPTCHA from "react-google-recaptcha";
import { useState } from "react";

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
    organization: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

interface SignupFormProps {
  role: string;
}

type UserRole = "government" | "bidder" | "public";

const SignupForm = ({ role }: SignupFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      organization: "",
    },
  });

  const validateRole = (inputRole: string): UserRole => {
    if (["government", "bidder", "public"].includes(inputRole)) {
      return inputRole as UserRole;
    }
    console.warn(`Invalid role "${inputRole}" provided, defaulting to "public"`);
    return "public";
  };

  const onCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!captchaToken) {
      toast({
        variant: "destructive",
        title: "Captcha Required",
        description: "Please complete the CAPTCHA to continue.",
      });
      return;
    }

    try {
      const validatedRole = validateRole(role);

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.name,
            role: validatedRole,
            organization: values.organization,
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            full_name: values.name,
            role: validatedRole,
            organization: values.organization || null,
          });

        if (profileError) {
          console.error("Error creating profile:", profileError);
          toast({
            variant: "destructive",
            title: "Profile Error",
            description:
              "Your account was created, but there was an issue setting up your profile. Please contact support.",
          });
        }

        await checkAuth();
        toast({
          title: "Success",
          description:
            "Your account has been created successfully. Please check your email to verify your account.",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {(role === "government" || role === "bidder") && (
          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your organization name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirm your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* reCAPTCHA Component */}
        <div className="flex justify-center">
          <ReCAPTCHA 
            sitekey="6LeSrf0qAAAAALc_6K_cFZCNoZyNoA3oQMcpmqFH" 
            onChange={onCaptchaChange} 
          />
        </div>

        <Button type="submit" className="w-full" disabled={!captchaToken}>
          Sign Up
        </Button>
      </form>
    </Form>
  );
};

export default SignupForm;
