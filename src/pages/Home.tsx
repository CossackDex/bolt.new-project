@@ .. @@
 import React from 'react';
-import { Link } from 'react-router-dom';
+import { Link, useNavigate } from 'react-router-dom';
 import { Building2, CheckSquare, Users, BarChart3, ArrowRight } from 'lucide-react';
+import { useAuth } from '../hooks/useAuth';
 
 export function Home() {
 }
+  const { user } = useAuth();
+  const navigate = useNavigate();
+
   return (
   )
@@ .. @@
             Streamline your construction projects with our comprehensive management platform.
             Track progress, manage teams, and deliver projects on time and within budget.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
-            <Link
-              to="/auth"
+            <button
+              onClick={() => navigate(user ? '/dashboard' : '/auth')}
               className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center justify-center"
             >
-              Get Started
+              {user ? 'Go to Dashboard' : 'Get Started'}
               <ArrowRight className="ml-2 w-5 h-5" />
-            </Link>
+            </button>
             <Link
-              to="/auth"
+              to="/pricing"
               className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition-colors"
             >
-              Learn More
+              View Pricing
             </Link>
           </div>