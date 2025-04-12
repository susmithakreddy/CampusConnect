const handleSubmit = async (e) => {
    e.preventDefault();
    if (!departmentId) {
      alert('Please select a department.');
      return;
    }
  
    const token = await getAccessToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }
  
    const method = program ? 'PATCH' : 'POST';
    const url = program
      ? `http://localhost:8003/api/admin/programs/${program.id}/`
      : `http://localhost:8003/api/admin/programs/`;
  
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          program_type: programType,
          duration_years: parseInt(duration, 10),
          department_id: parseInt(departmentId, 10),
        }),
      });
  
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Submit program server error:', errorData);
        alert(errorData.detail || 'Failed to submit program.');
        return;
      }
  
      onClose();
    } catch (err) {
      console.error('Submit program fetch error:', err);
      alert('Network error while submitting program.');
    }
  };
  