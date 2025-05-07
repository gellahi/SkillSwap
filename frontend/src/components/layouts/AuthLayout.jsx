import { Link, Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/">
          <img
            className="mx-auto h-12 w-auto"
            src="/logo.svg"
            alt="SkillSwap"
          />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          SkillSwap
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
        
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
