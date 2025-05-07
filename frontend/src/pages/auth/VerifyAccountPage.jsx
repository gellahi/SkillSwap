import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyAccount, resendVerification } from '../../features/auth/authSlice';

const VerifyAccountPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useSelector(state => state.auth);
  
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, success, error
  const [resendStatus, setResendStatus] = useState('idle'); // idle, loading, success, error
  const [countdown, setCountdown] = useState(0);
  
  // Get token from URL
  const token = searchParams.get('token');
  
  useEffect(() => {
    // If token is present, verify account
    if (token) {
      dispatch(verifyAccount({ token }))
        .unwrap()
        .then(() => {
          setVerificationStatus('success');
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        })
        .catch(() => {
          setVerificationStatus('error');
        });
    }
  }, [token, dispatch, navigate]);
  
  const handleResendVerification = () => {
    if (countdown > 0) return;
    
    setResendStatus('loading');
    
    dispatch(resendVerification())
      .unwrap()
      .then(() => {
        setResendStatus('success');
        // Start countdown for 60 seconds
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      })
      .catch(() => {
        setResendStatus('error');
      });
  };
  
  // If token is present, show verification result
  if (token) {
    if (verificationStatus === 'pending' || loading) {
      return (
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Verifying Your Account</h1>
            <p className="mt-2 text-gray-600">
              Please wait while we verify your account...
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              This will only take a moment.
            </p>
          </div>
        </div>
      );
    }
    
    if (verificationStatus === 'success') {
      return (
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Account Verified!</h1>
            <p className="mt-2 text-gray-600">
              Your account has been successfully verified.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            
            <p className="mt-4 text-gray-600">
              Thank you for verifying your email address. You can now access all features of SkillSwap.
            </p>
            
            <p className="mt-2 text-sm text-gray-500">
              Redirecting to dashboard in a few seconds...
            </p>
            
            <div className="mt-6">
              <Link
                to="/dashboard"
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }
    
    if (verificationStatus === 'error') {
      return (
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Verification Failed</h1>
            <p className="mt-2 text-gray-600">
              We couldn't verify your account with the provided link.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            
            <p className="mt-4 text-gray-600">
              The verification link may have expired or is invalid.
            </p>
            
            <div className="mt-6">
              <button
                onClick={handleResendVerification}
                disabled={countdown > 0 || resendStatus === 'loading'}
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendStatus === 'loading' ? 'Sending...' : 
                 countdown > 0 ? `Resend in ${countdown}s` : 
                 'Resend Verification Email'}
              </button>
            </div>
          </div>
        </div>
      );
    }
  }
  
  // If no token, show instructions to check email
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
        <p className="mt-2 text-gray-600">
          We've sent a verification link to your email address
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          
          <p className="mt-4 text-gray-600">
            Please check your email inbox and click the verification link to complete your registration. The link will expire in 24 hours.
          </p>
          
          {user && (
            <p className="mt-2 text-sm text-gray-500">
              We sent an email to: <span className="font-medium">{user.email}</span>
            </p>
          )}
          
          <div className="mt-6">
            <p className="text-gray-600 mb-4">
              Didn't receive the email?
            </p>
            
            <button
              onClick={handleResendVerification}
              disabled={countdown > 0 || resendStatus === 'loading'}
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendStatus === 'loading' ? 'Sending...' : 
               countdown > 0 ? `Resend in ${countdown}s` : 
               'Resend Verification Email'}
            </button>
            
            {resendStatus === 'success' && (
              <p className="mt-2 text-sm text-green-600">
                Verification email has been resent!
              </p>
            )}
            
            {resendStatus === 'error' && (
              <p className="mt-2 text-sm text-red-600">
                Failed to resend verification email. Please try again later.
              </p>
            )}
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-center text-sm text-gray-600">
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
};

export default VerifyAccountPage;
