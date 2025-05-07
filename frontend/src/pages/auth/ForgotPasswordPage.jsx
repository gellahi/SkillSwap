import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { forgotPassword } from '../../features/auth/authSlice';

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.auth);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  
  const initialValues = {
    email: ''
  };
  
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
  });
  
  const handleSubmit = (values) => {
    setEmail(values.email);
    
    dispatch(forgotPassword(values))
      .unwrap()
      .then(() => {
        setSubmitted(true);
      })
      .catch(error => {
        console.error('Password reset request failed:', error);
      });
  };
  
  if (submitted) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-2 text-gray-600">
            We've sent a password reset link to <span className="font-medium">{email}</span>
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            
            <p className="mt-4 text-gray-600">
              Please check your email inbox and follow the instructions to reset your password. The link will expire in 30 minutes.
            </p>
            
            <p className="mt-4 text-gray-600">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                try again
              </button>
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Forgot your password?</h1>
        <p className="mt-2 text-gray-600">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  className={`w-full p-3 border ${
                    errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="your@email.com"
                />
                <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
      
      <p className="mt-8 text-center text-sm text-gray-600">
        Remember your password?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
