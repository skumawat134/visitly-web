import React from 'react'
import  {PreRegistration}  from '../components/PreRegistration';
import { useParams } from 'react-router-dom';

export const EditInvite = () => {
  const { id } = useParams();
    return (
            <PreRegistration
                onClose={() => { }}
                status={"Update"}
                visitId={id}
            />
    )
}

export default EditInvite;