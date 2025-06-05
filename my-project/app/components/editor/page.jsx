"use client";

import React, { useState } from "react";
import { Button, Input, Checkbox, Link, Form, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible((v) => !v);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(isSignUp ? "Signing Up..." : "Signing In...");
    // Add Supabase or API logic here
  };

  return (
    <div className="flex h-full w-screen items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large">
        <div className="flex flex-col items-center pb-6">
          {/* <AcmeIcon size={60} /> */}
          <p className="text-xl font-medium">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </p>
          <p className="text-small text-default-500">
            {isSignUp
              ? "Sign up to start your journey"
              : "Log in to your account to continue"}
          </p>
        </div>

        <Form className="flex flex-col gap-3" validationBehavior="native" onSubmit={handleSubmit}>
          <Input
            isRequired
            label="Email Address"
            name="email"
            placeholder="Enter your email"
            type="email"
            variant="bordered"
          />
          <Input
            isRequired
            endContent={
              <button type="button" onClick={toggleVisibility}>
                {isVisible ? (
                  <Icon className="pointer-events-none text-2xl text-default-400" icon="solar:eye-closed-linear" />
                ) : (
                  <Icon className="pointer-events-none text-2xl text-default-400" icon="solar:eye-bold" />
                )}
              </button>
            }
            label="Password"
            name="password"
            placeholder="Enter your password"
            type={isVisible ? "text" : "password"}
            variant="bordered"
          />
          {isSignUp && (
            <Input
              isRequired
              label="Confirm Password"
              name="confirmPassword"
              placeholder="Confirm your password"
              type={isVisible ? "text" : "password"}
              variant="bordered"
            />
          )}
          <div className="flex w-full items-center justify-between px-1 py-2">
            <Checkbox name="remember" size="sm">
              Remember me
            </Checkbox>
            {!isSignUp && (
              <Link className="text-default-500" href="#" size="sm">
                Forgot password?
              </Link>
            )}
          </div>
          <Button className="w-full" color="primary" type="submit">
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </Form>

        <div className="flex items-center gap-4 py-2">
          <Divider className="flex-1" />
          <p className="shrink-0 text-tiny text-default-500">OR</p>
          <Divider className="flex-1" />
        </div>

        <div className="flex flex-col gap-2">
          <Button startContent={<Icon icon="flat-color-icons:google" width={24} />} variant="bordered">
            Continue with Google
          </Button>
          <Button startContent={<Icon icon="fe:github" width={24} />} variant="bordered">
            Continue with GitHub
          </Button>
        </div>

        <p className="text-center text-small">
          {isSignUp ? "Already have an account?" : "Need to create an account?"}{" "}
          <Link onClick={() => setIsSignUp(!isSignUp)} href="#" size="sm">
            {isSignUp ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
}
