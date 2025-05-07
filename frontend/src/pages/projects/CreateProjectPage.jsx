import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createProject } from '../../features/projects/projectsSlice';
import { 
  PlusIcon, 
  XMarkIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

const CreateProjectPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(state => state.projects);
  
  const [categories, setCategories] = useState([
    { id: '1', name: 'Web Development' },
    { id: '2', name: 'Mobile Development' },
    { id: '3', name: 'UI/UX Design' },
    { id: '4', name: 'Content Writing' },
    { id: '5', name: 'Digital Marketing' },
    { id: '6', name: 'Data Science' }
  ]);
  
  const [skillInput, setSkillInput] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [attachments, setAttachments] = useState([]);
  
  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Title is required')
      .min(10, 'Title must be at least 10 characters')
      .max(100, 'Title must be at most 100 characters'),
    description: Yup.string()
      .required('Description is required')
      .min(50, 'Description must be at least 50 characters'),
    category: Yup.string()
      .required('Category is required'),
    budget: Yup.number()
      .required('Budget is required')
      .positive('Budget must be positive'),
    deadline: Yup.date()
      .required('Deadline is required')
      .min(new Date(), 'Deadline must be in the future')
  });
  
  const initialValues = {
    title: '',
    description: '',
    category: '',
    budget: '',
    deadline: '',
    isPrivate: false
  };
  
  const handleAddSkill = () => {
    if (skillInput.trim() && !selectedSkills.includes(skillInput.trim())) {
      setSelectedSkills([...selectedSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };
  
  const handleRemoveSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    
    setAttachments([...attachments, ...newAttachments]);
  };
  
  const handleRemoveAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };
  
  const handleSubmit = (values) => {
    const projectData = {
      ...values,
      skills: selectedSkills,
      attachments: attachments.map(att => att.file)
    };
    
    dispatch(createProject(projectData))
      .unwrap()
      .then(response => {
        navigate(`/projects/${response._id}`);
      })
      .catch(error => {
        console.error('Failed to create project:', error);
      });
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a New Project</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title
                </label>
                <Field
                  type="text"
                  id="title"
                  name="title"
                  placeholder="e.g., Professional E-commerce Website Development"
                  className={`w-full p-2 border ${
                    errors.title && touched.title ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:ring-primary-500 focus:border-primary-500`}
                />
                <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Description
                </label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  rows="6"
                  placeholder="Describe your project requirements, goals, and expectations in detail..."
                  className={`w-full p-2 border ${
                    errors.description && touched.description ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:ring-primary-500 focus:border-primary-500`}
                />
                <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Field
                  as="select"
                  id="category"
                  name="category"
                  className={`w-full p-2 border ${
                    errors.category && touched.category ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:ring-primary-500 focus:border-primary-500`}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="category" component="div" className="mt-1 text-sm text-red-600" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills Required
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder="e.g., React, Node.js, UI Design"
                    className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-primary-400 hover:text-primary-700 focus:outline-none"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {selectedSkills.length === 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    Add skills that are required for your project
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                    Budget (USD)
                  </label>
                  <Field
                    type="number"
                    id="budget"
                    name="budget"
                    min="1"
                    placeholder="e.g., 500"
                    className={`w-full p-2 border ${
                      errors.budget && touched.budget ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:ring-primary-500 focus:border-primary-500`}
                  />
                  <ErrorMessage name="budget" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <Field
                    type="date"
                    id="deadline"
                    name="deadline"
                    className={`w-full p-2 border ${
                      errors.deadline && touched.deadline ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:ring-primary-500 focus:border-primary-500`}
                  />
                  <ErrorMessage name="deadline" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF, DOC up to 10MB each
                    </p>
                  </div>
                </div>
                
                {attachments.length > 0 && (
                  <ul className="mt-3 divide-y divide-gray-200 border border-gray-200 rounded-md">
                    {attachments.map((attachment, index) => (
                      <li key={index} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                        <div className="flex items-center flex-1 w-0">
                          <span className="ml-2 flex-1 w-0 truncate">
                            {attachment.name}
                          </span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(index)}
                            className="font-medium text-red-600 hover:text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="flex items-center">
                <Field
                  type="checkbox"
                  id="isPrivate"
                  name="isPrivate"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-900">
                  Make this project private (only invited freelancers can see it)
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/my-projects')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateProjectPage;
