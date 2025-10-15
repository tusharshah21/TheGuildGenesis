use async_trait::async_trait;
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use rsa::pkcs1::{DecodeRsaPrivateKey, EncodeRsaPrivateKey, EncodeRsaPublicKey, LineEnding};
use rsa::{RsaPrivateKey, RsaPublicKey};
use serde::{Deserialize, Serialize};
use sha3::{Digest, Sha3_256};
use std::fs;
use std::sync::Arc;

use crate::domain::repositories::refresh_token_repository::RefreshTokenRecord;
use crate::domain::value_objects::WalletAddress;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // wallet address
    pub iat: i64,
    pub exp: i64,
    pub token_type: String, // "access" or "refresh"
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenPair {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: i64,
}

#[derive(Debug, Clone)]
pub struct RefreshTokenData {
    pub id: String,
    pub wallet_address: WalletAddress,
    pub token_hash: String,
    pub expires_at: chrono::DateTime<Utc>,
    pub created_at: chrono::DateTime<Utc>,
}

#[async_trait]
pub trait JwtService: Send + Sync {
    async fn generate_token_pair(&self, wallet_address: &WalletAddress) -> Result<TokenPair, Box<dyn std::error::Error>>;
    async fn validate_access_token(&self, token: &str) -> Result<WalletAddress, Box<dyn std::error::Error>>;
    async fn validate_refresh_token(&self, token: &str) -> Result<RefreshTokenRecord, Box<dyn std::error::Error>>;
    async fn revoke_refresh_token(&self, token_hash: &str) -> Result<(), Box<dyn std::error::Error>>;
}

pub struct RsaJwtService {
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
}

impl RsaJwtService {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let private_key_pem = fs::read_to_string("keys/private.pem")
            .or_else(|_| Self::generate_and_save_keys())?;

        let private_key = RsaPrivateKey::from_pkcs1_pem(&private_key_pem)?;
        let public_key = RsaPublicKey::from(&private_key);

        let encoding_key = EncodingKey::from_rsa_pem(private_key_pem.as_bytes())?;
        let decoding_key = DecodingKey::from_rsa_pem(public_key.to_pkcs1_pem(LineEnding::default())?.as_bytes())?;

        Ok(Self {
            encoding_key,
            decoding_key,
        })
    }

    fn generate_and_save_keys() -> Result<String, Box<dyn std::error::Error>> {
        fs::create_dir_all("keys")?;

        let mut rng = rand::thread_rng();
        let private_key = RsaPrivateKey::new(&mut rng, 2048)?;
        let public_key = RsaPublicKey::from(&private_key);

        let private_key_pem = private_key.to_pkcs1_pem(LineEnding::default())?.to_string();
        let public_key_pem = public_key.to_pkcs1_pem(LineEnding::default())?.to_string();

        fs::write("keys/private.pem", &private_key_pem)?;
        fs::write("keys/public.pem", &public_key_pem)?;

        Ok(private_key_pem)
    }

    fn hash_token(token: &str) -> String {
        let mut hasher = Sha3_256::new();
        hasher.update(token.as_bytes());
        format!("{:x}", hasher.finalize())
    }
}

#[async_trait]
impl JwtService for RsaJwtService {
    async fn generate_token_pair(&self, wallet_address: &WalletAddress) -> Result<TokenPair, Box<dyn std::error::Error>> {
        let now = Utc::now();
        let access_exp = (now + Duration::hours(24)).timestamp();
        let refresh_exp = (now + Duration::days(7)).timestamp();

        let access_claims = Claims {
            sub: wallet_address.0.clone(),
            iat: now.timestamp(),
            exp: access_exp,
            token_type: "access".to_string(),
        };

        let refresh_claims = Claims {
            sub: wallet_address.0.clone(),
            iat: now.timestamp(),
            exp: refresh_exp,
            token_type: "refresh".to_string(),
        };

        let header = Header::new(Algorithm::RS256);

        let access_token = encode(&header, &access_claims, &self.encoding_key)?;
        let refresh_token = encode(&header, &refresh_claims, &self.encoding_key)?;

        Ok(TokenPair {
            access_token,
            refresh_token,
            expires_in: 86400, // 24 hours in seconds
        })
    }

    async fn validate_access_token(&self, token: &str) -> Result<WalletAddress, Box<dyn std::error::Error>> {
        let validation = Validation::new(Algorithm::RS256);
        let token_data = decode::<Claims>(token, &self.decoding_key, &validation)?;

        if token_data.claims.token_type != "access" {
            return Err("Invalid token type".into());
        }

        if token_data.claims.exp < Utc::now().timestamp() {
            return Err("Token expired".into());
        }

        Ok(WalletAddress(token_data.claims.sub))
    }

    async fn validate_refresh_token(&self, token: &str) -> Result<RefreshTokenRecord, Box<dyn std::error::Error>> {
        let validation = Validation::new(Algorithm::RS256);
        let token_data = decode::<Claims>(token, &self.decoding_key, &validation)?;

        if token_data.claims.token_type != "refresh" {
            return Err("Invalid token type".into());
        }

        if token_data.claims.exp < Utc::now().timestamp() {
            return Err("Token expired".into());
        }

        let token_hash = Self::hash_token(token);

        Ok(RefreshTokenRecord {
            id: uuid::Uuid::new_v4().to_string(),
            wallet_address: WalletAddress(token_data.claims.sub),
            token_hash,
            expires_at: chrono::DateTime::from_timestamp(token_data.claims.exp, 0).unwrap(),
            created_at: Utc::now(),
        })
    }

    async fn revoke_refresh_token(&self, _token_hash: &str) -> Result<(), Box<dyn std::error::Error>> {
        // This would be implemented when we add the repository method
        Ok(())
    }
}