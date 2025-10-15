use std::sync::Arc;

use crate::domain::repositories::RefreshTokenRepository;
use crate::domain::services::jwt_service::JwtService;

#[derive(Debug)]
pub struct LogoutCommand {
    pub refresh_token: String,
}

pub async fn logout(
    refresh_token_repository: Arc<dyn RefreshTokenRepository>,
    jwt_service: Arc<dyn JwtService>,
    command: LogoutCommand,
) -> Result<(), Box<dyn std::error::Error>> {
    // Validate the refresh token to get its hash
    let refresh_token_data = jwt_service.validate_refresh_token(&command.refresh_token).await?;
    refresh_token_repository.revoke_refresh_token(&refresh_token_data.token_hash).await?;
    Ok(())
}