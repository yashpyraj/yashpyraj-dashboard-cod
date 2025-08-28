@@ .. @@
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     
     const startDateTime = `${formData.startDate}T${formData.startTime}:00`;
     const endDateTime = `${formData.endDate}T${formData.endTime}:00`;
     
     const eventData: Partial<AllianceEvent> = {
       title: formData.title,
       description: formData.description,
       type: formData.type,
       startDate: startDateTime,
       endDate: endDateTime,
       location: formData.location || undefined,
       maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
       rewards: formData.rewards.length > 0 ? formData.rewards : defaultRewards[formData.type] || [],
       status: 'UPCOMING',
       rsvps: []
     };

     onSubmit(eventData);
-    onClose();
     
     // Reset form
     setFormData({
       title: '',
       description: '',
       type: 'KILL_EVENT',
       startDate: '',
       startTime: '',
       endDate: '',
       endTime: '',
       location: '',
       maxParticipants: '',
       announceToDiscord: true,
       rewards: []
     });
   };