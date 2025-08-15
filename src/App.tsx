import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Mentors from './pages/Mentors';
import Mentees from './pages/Mentees';
import Supporters from './pages/Supporters';
import PartnerCompanies from './pages/PartnerCompanies';
import PartnerOrganizations from './pages/PartnerOrganizations';
import Relations from './pages/Relations';
import ContactDetail from './pages/ContactDetail';
import CompanyDetail from './pages/CompanyDetail';
import OrganizationDetail from './pages/OrganizationDetail';
import RelationDetail from './pages/RelationDetail';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/mentors/:id" element={<ContactDetail type="mentor" />} />
          <Route path="/mentees" element={<Mentees />} />
          <Route path="/mentees/:id" element={<ContactDetail type="mentee" />} />
          <Route path="/supporters" element={<Supporters />} />
          <Route path="/supporters/:id" element={<ContactDetail type="supporter" />} />
          <Route path="/partner-companies" element={<PartnerCompanies />} />
          <Route path="/partner-companies/:id" element={<CompanyDetail />} />
          <Route path="/partner-organizations" element={<PartnerOrganizations />} />
          <Route path="/partner-organizations/:id" element={<OrganizationDetail />} />
          <Route path="/relations" element={<Relations />} />
          <Route path="/relations/:id" element={<RelationDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
