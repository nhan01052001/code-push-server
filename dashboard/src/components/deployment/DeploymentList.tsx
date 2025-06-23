import React from "react";
import DeploymentCard, { Deployment } from "./DeploymentCard";
import "../../styles/AppDetails.css";

interface DeploymentListProps {
  deployments: Deployment[];
  onDeploymentClick: (deploymentName: string) => void;
  onDeleteDeployment: (deploymentName: string) => void;
}

const DeploymentList: React.FC<DeploymentListProps> = ({
  deployments,
  onDeploymentClick,
  onDeleteDeployment,
}) => {
  if (deployments.length === 0) {
    return <div>Không có deployment nào.</div>;
  }

  return (
    <div className="deployment-card-grid">
      {deployments.map((deployment) => (
        <div key={deployment.name} className="card-container">
          <DeploymentCard
            deployment={deployment}
            onClick={() => onDeploymentClick(deployment.name)}
            onDelete={() => onDeleteDeployment(deployment.name)}
          />
        </div>
      ))}
    </div>
  );
};

export default DeploymentList; 