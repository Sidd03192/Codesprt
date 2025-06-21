"use client";
import { redirect } from 'next/navigation'

import {supabase} from '../../supabase-client'
import React, { useState } from "react";
import { Button, Input, Checkbox, Link, Form, Divider, Alert, Card } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Spinner } from '@heroui/react';
import Image from "next/image";

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible((v) => !v);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState("success"); // "success" | "danger"
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");
  const [role, setRole] = useState("student");

  const description = "We've sent you a confirmation email. Please check your inbox to verify your account.";
  const title = "Account Created Successfully!";
  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  if (isSignUp) {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error("Error signing up:", signUpError.message);
      setAlertType("danger");
      setAlertTitle("Sign Up Failed");
      setAlertDescription(signUpError.message || "An error occurred during sign up.");
      setIsVisible(true);
    } 
    else {
      setAlertType("success");
      setAlertTitle("Account Created Successfully!");
      setAlertDescription("We've sent you a confirmation email. Please check your inbox to verify your account.");
      setIsVisible(true);
      updateDatabase(data.user);
    }
  } 
  else {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("Error signing in:", signInError.message);
      setAlertType("danger");
      setAlertTitle("Sign In Failed");
      setAlertDescription(signInError.message || "An error occurred during sign in.");
      setIsVisible(true);
    } else {
        redirect('/dashboard') 
    }
  }

  setLoading(false);
};

  const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/${role === "teacher" ? "dashboard" : "student-dashboard"}`, // or wherever you want
      },
    });
    updateDatabase(data.user);
    if (error) {
      console.error("OAuth Sign-in Error:", error.message);
      console.error("Error signing in:", signInError.message);
      setAlertType("danger");
      setAlertTitle("Sign In Failed");
      setAlertDescription(signInError.message || "An error occurred during sign in.");
      setIsVisible(true);
    } else {
      console.log("OAuth redirecting…", data);
    }
  } catch (err) {
    console.error("Unexpected error during Google Sign-in:", err.message);
  }
  };
  

  const updateDatabase = async (user) => {
    console.log("Updating database for user:", user);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          { id: user.id, email: user.email, created_at: new Date(), role: role  }
        ]);

      if (error) {
        console.error("Error inserting user into database:", error.message);
      } else {
        console.log("User inserted successfully:", data);
      }
    } catch (err) {
      console.error("Unexpected error during database update:", err.message);
    }
  }

  return (
    <div className='relative w-full h-full'>
      <div
  className=" absolute top-4 left-1/2 -translate-x-1/2 z-50  "
>
 <Alert
  color={alertType}
  description={alertDescription}
  isVisible={isVisible}
  title={alertTitle}
  variant="solid"
  onClose={() => setIsVisible(false)}
  endContent={
    alertType === "success" ? (
      <Button
        color="success"
        size="sm"
        variant="flat"
        onClick={() => window.open("https://mail.google.com", "_blank")}
      >
        Verify
      </Button>
    ) : null
  }
/>

</div>

      
      <div className="flex h-full w-full items-center justify-center px-4 ">

      
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large ">
          <div className="flex flex-col items-center pb-6">
            <Image
            aria-hidden
            src="/mascot.png"
            alt="Globe icon"
            width={90}
            height={90}
          />
              
          <p className="text-xl font-medium">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </p>
          <p className="text-small text-default-500">
            {isSignUp
              ? "Sign up to start your journey"
              : "Log in to your account to continue"}
          </p>
        </div>

        <Form className="flex flex-col gap-3 " validationBehavior="native" onSubmit={handleSubmit}>
          <Input
            isRequired
            label="Email Address"
            name="email"
            placeholder="Enter your email"
            type="email"
            variant="bordered"
            value={email} // ← add this line
            onChange={(e) => setEmail(e.target.value)}
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
               validate={(value) => {
          if (value.length < 6) {
            return "Password must be at least 6  characters long";
          }

          return value === "admin" ? "Nice try!" : null;
        }}
            onChange={(e) => setPassword(e.target.value)}
              value={password}
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
          <div className="flex w-full items-center justify-between px-1 py-2 ">
            <Checkbox name="remember" size="sm">
              Remember me
            </Checkbox>
            {!isSignUp && (
              <Link className="text-default-500" href="#" size="sm">
                Forgot password?
              </Link>
            )}
          </div>
          {isSignUp && (
          <div className="flex justify-center py-2">
    <div className="flex items-center space-x-2 border rounded-full px-2 py-1 bg-gray-100">
      <span className={`text-sm px-2 py-1 rounded-full cursor-pointer transition ${
        role === "student" ? "bg-primary text-white" : "text-gray-600"
      }`} onClick={() => setRole("student")}>
        Student
      </span>
      <span className={`text-sm px-2 py-1 rounded-full cursor-pointer transition ${
        role === "teacher" ? "bg-primary text-white" : "text-gray-600"
      }`} onClick={() => setRole("teacher")}>
        Teacher
      </span>
    </div>
  </div>
)}
          <Button className="w-full" color="primary" type="submit" loading={loading} spinner={<Spinner/>}>
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </Form>

        <div className="flex items-center gap-4 py-2">
          <Divider className="flex-1" />
          <p className="shrink-0 text-tiny text-default-500">OR</p>
          <Divider className="flex-1" />
        </div>

        <div className="flex flex-col gap-2">
          <Button onPress={signInWithGoogle} startContent={<Icon icon="flat-color-icons:google" width={24} />} variant="ghost">
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
          </div>

  );
}
