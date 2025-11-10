use anchor_lang::prelude::*;

declare_id!("2Hg6qeZGBsMPDDM1RY65Ucwk5JbLrF3D3P9qdYbEfmSU");

#[program]
pub mod guitar_contest {
    use super::*;

    /*
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
    */

    /// Instruction 1: Creates a new SubmissionAccount to host a video
    pub fn create_submission(
        ctx: Context<CreateSubmission>,
        title: String,
        youtube_id: String,
    ) -> Result<()> {
        // We get the account to create from our context
        let submission = &mut ctx.accounts.submission;

        // Set the data on the new account
        submission.contestant = ctx.accounts.user.key(); // The user who submitted it
        submission.title = title;
        submission.youtube_id = youtube_id;
        submission.vote_count = 0; // Start with 0 votes

        msg!("New submission created by: {}", ctx.accounts.user.key());
        msg!("Title: {}", submission.title);
        msg!("YouTube ID: {}", submission.youtube_id);
        Ok(())
    }

    /// Instruction 2: Allows a user to vote for a submission.
    /// This instruction uses a PDA (VoteReceipt) to prevent double voting.
    /// Now also awards 3 PEG tokens to the voter's UserProfile PDA (NEW)
    pub fn vote(ctx: Context<Vote>) -> Result<()> {
        // We get the submission account from the context and increment its vote count
        let submission = &mut ctx.accounts.submission;
        let user_profile = &mut ctx.accounts.user_profile;
        let performer_profile = &mut ctx.accounts.performer_profile;


        // If this is the first time the user is interacting,
        // their authority will be the default (all zeros). Let's set it.
        if user_profile.authority == Pubkey::default() {
            user_profile.authority = ctx.accounts.user.key();
        }
 
        // The `VoteReceipt` account is created by the `#[account(init...)]`
        // macro in the Vote context below.
        // If the user tries to vote again, the program will fail trying
        // to create this account because it already exists (PDA collision).
        submission.vote_count = submission.vote_count.checked_add(1).unwrap();
        
        // If this is the first time the PERFORMER is receiving PEG,
        // their authority will be the default (all zeros). Let's set it.
        // We get the contestant's Pubkey from the submission account.
        if performer_profile.authority == Pubkey::default() {
            performer_profile.authority = submission.contestant;
        }

        // Reward the performer with 3 PEG tokens (New)
        performer_profile.peg_balance += 3; 

        msg!("Vote successful for submission: {}", submission.key());
        msg!("Total votes: {}", submission.vote_count);
        msg!("Performer {} now has {} PEG.", performer_profile.authority, performer_profile.peg_balance);

        Ok(())
    }

    //// --- ADD NEW FUNCTIONS FOR SUBMISSION UPDATE  ---
    pub fn update_submission(
        ctx: Context<UpdateSubmission>,
        new_title: String,
        new_youtube_id: String
    ) -> Result<()> {
        // The context already checked that the signer is the original contestant
        // so we can now safely update the data.
        let submission = &mut ctx.accounts.submission;
        submission.title = new_title;
        submission.youtube_id = new_youtube_id;

        msg!("Submission updated!");
        msg!("New Title: {}", submission.title);
        msg!("New YouTube ID: {}", submission.youtube_id);
        Ok(())
    }
}

// -----------------------------------------------------------------
// 1. ACCOUNTS & CONTEXTS FOR 'create_submission'
// -----------------------------------------------------------------
#[derive(Accounts)]
pub struct CreateSubmission<'info> {
    // This creates (initializes) a new account.
    // We are defining its space: 8 bytes for the "discriminator"
    // + 32 for the contestant's Pubkey
    // + (4 + 50) for the title string (max 50 chars)
    // + (4 + 20) for the YouTube ID string (max 20 chars)
    // + 8 for the vote_count (u64)
    #[account(
        init,
        payer = user,
        space = 8 + 32 + (4 + 50) + (4 + 20) + 8 
    )]
    pub submission: Account<'info, SubmissionAccount>,

    // The 'user' is the person paying for the account's rent
    #[account(mut)]
    pub user: Signer<'info>,
    
    // The System Program is required by Solana to create new accounts
    pub system_program: Program<'info, System>,
}

// This is the data structure for our SubmissionAccount
#[account]
pub struct SubmissionAccount {
    pub contestant: Pubkey,
    pub title: String,
    pub youtube_id: String,
    pub vote_count: u64,
}

// -----------------------------------------------------------------
// 2. ACCOUNTS & CONTEXTS FOR 'vote'
// -----------------------------------------------------------------
#[derive(Accounts)]
pub struct Vote<'info> {
    // We mark the submission as 'mut' because we are changing its `vote_count`
    #[account(mut)]
    pub submission: Account<'info, SubmissionAccount>,

    // This is our "vote-once" PDA receipt.
    // It's an empty account that we create.
    // Its unique address (PDA) is "derived" from two "seeds":
    // 1. The user's public key
    // 2. The submission's public key
    // This means a specific user can only create this account ONCE
    // for a specific submission.
    //
    #[account(
        init,
        payer = user,
        space = 8, // 8 bytes for the discriminator
        seeds = [user.key().as_ref(), submission.key().as_ref()],
        bump
    )]
    pub vote_receipt: Account<'info, VoteReceipt>,

    // The profile account for the PERFORMER (the submission.contestant).
    // The 'user' (voter) will pay the rent to create this if it's the
    //  performer's first time receiving PEG.
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 8, // 8(disc) + 32(authority) + 8(peg_balance)
        // The seeds are based on the PERFORMER's key, not the signer's key
        seeds = [b"profile", submission.contestant.as_ref()],
        bump
    )]
    pub performer_profile: Account<'info, UserProfile>,

    // The 'user' is the voter
    #[account(mut)]
    pub user: Signer<'info>,

    // The System Program is required to create the receipt account
    pub system_program: Program<'info, System>,
}

//// --- ADD NEW STRUCT FOR SUBMISSION UPDATE  ---
// -----------------------------------------------------------------
// 3. ACCOUNTS & CONTEXTS FOR 'update_submission'
// -----------------------------------------------------------------
#[derive(Accounts)]
pub struct UpdateSubmission<'info> {
    // We must check that the person signing this transaction
    // is the *same person* who created the submission.
    // We use a constraint to check the 'contestant' field on the
    // submission account against the 'user' (signer).
    // [cite: 5859-5867, 5905-5907, 5973-5976]
    #[account(
        mut,
        constraint = submission.contestant == user.key() @ ErrorCode::NotContestant
    )]
    pub submission: Account<'info, SubmissionAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
}

//// --- NEW STRUCTS AND CONTEXTS ---
// -----------------------------------------------------------------
// 4. ACCOUNTS FOR PEG TOKENS 
// -----------------------------------------------------------------

// This is the new account that holds a user's PEG balance
#[account]
pub struct UserProfile {
    pub authority: Pubkey,
    pub peg_balance: u64,
}

// This is a generic context for any function that just needs to
// create or modify a user's PEG balance.
#[derive(Accounts)]
pub struct ManagePegs<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 8, // 8(disc) + 32(authority) + 8(peg_balance)
        seeds = [b"profile", user.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}
// --- END NEW ---


//// --- ADD THIS NEW ERROR CODE ---
#[error_code]
pub enum ErrorCode {
    #[msg("Only the original contestant can update this submission.")]
    NotContestant,
}



// This is the data structure for our receipt (it's empty)
#[account]
pub struct VoteReceipt {}

/*
#[derive(Accounts)]
pub struct Initialize {}
*/
