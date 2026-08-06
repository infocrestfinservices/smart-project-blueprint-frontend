import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MailCheck, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { authService } from "@/api/authService";

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || "");
  const initialDevOtp = location.state?.devOtp || "";
  const [otp, setOtp] = useState(
    /^\d{6}$/.test(initialDevOtp) ? initialDevOtp.split("") : ["", "", "", "", "", ""]
  );
  const [devOtp, setDevOtp] = useState(initialDevOtp);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [success, setSuccess] = useState(false);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, "");
    
    if (numericValue.length > 1) {
      // Handle paste
      const pastedData = numericValue.slice(0, 6).split("");
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        if (index + i < 6) newOtp[index + i] = pastedData[i];
      }
      setOtp(newOtp);
      // Focus next empty or last input
      const nextIndex = Math.min(index + pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);

    // Auto-focus next input
    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await authService.verifyEmail(email, otpValue);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    try {
      const res = await authService.resendOtp(email);
      if (res?.dev_otp && /^\d{6}$/.test(res.dev_otp)) {
        setDevOtp(res.dev_otp);
        setOtp(res.dev_otp.split(""));
      }
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
    }
  };

  if (!email) return null;

  return (
    <AuthLayout
      icon={MailCheck}
      title="Verify Your Email"
      subtitle={
        <>
          We've sent a 6-digit verification code to:<br/>
          <span className="font-medium text-foreground">{email}</span>
        </>
      }
      footer={
        <div className="flex flex-col items-center gap-2">
          <span className="text-muted-foreground text-sm">
            Didn't receive the code?
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleResend} 
            disabled={resendCooldown > 0}
            className="text-primary hover:text-primary/80"
          >
            {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
          </Button>
          <div className="mt-4">
            <Link to="/register" className="text-xs text-muted-foreground hover:underline">
              Change Email
            </Link>
          </div>
        </div>
      }
    >
      {devOtp && (
        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 text-sm text-center">
          <span className="font-medium">Dev mode:</span> email sending isn't configured, so your code is{" "}
          <span className="font-mono font-bold tracking-widest">{devOtp}</span>{" "}
          (already filled in). Set up SMTP to email it instead.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 text-emerald-600 text-sm flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300">
          <MailCheck className="w-4 h-4" />
          Email verified successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-semibold bg-background border rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              disabled={loading || success}
            />
          ))}
        </div>

        <Button
          type="submit"
          className="w-full h-12 font-medium"
          disabled={loading || success || otp.join("").length !== 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
