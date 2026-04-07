import type { Player } from '@/types/game.types'

// ── TOPs ─────────────────────────────────────────────────────────────────────
import jeiel_up from './jeiel_up'
import bpm_zecapagod from './bpm_zecapagod'
import chogato027es from './chogato027es'
import cap_farinha from './cap_farinha'
import mielcohen from './mielcohen'
import chenderboy from './chenderboy'
import kissidane from './kissidane'
import osurt from './osurt'

// ── JUNGLEs ──────────────────────────────────────────────────────────────────
import galorural from './galorural'
import bshadow7 from './bshadow7'
import vo_corvo from './vo_corvo'
import zerochannn from './zerochannn'
import zangrando from './zangrando'
import vks_bmag from './vks_bmag'
import pdj_shaco_facao from './pdj_shaco_facao'
import robinhogamer17 from './robinhogamer17'
import veio_do_whatsapp from './veio_do_whatsapp'

// ── MIDs ─────────────────────────────────────────────────────────────────────
import castro_yse from './castro_yse'
import enzogostoso123 from './enzogostoso123'
import ruim_e_esquisito from './ruim_e_esquisito'
import kirah from './kirah'
import o_bobo from './o_bobo'
import danverii from './danverii'
import frenezeri from './frenezeri'
import azir_de_warmog from './azir_de_warmog'

// ── ADCs ─────────────────────────────────────────────────────────────────────
import lippeh from './lippeh'
import nkz from './nkz'
import elgato from './elgato'
import rluperini from './rluperini'
import thaaylady from './thaaylady'
import loose from './loose'
import megaextro from './megaextro'
import criz from './criz'

// ── SUPPORTs ─────────────────────────────────────────────────────────────────
import e_o_puxas from './e_o_puxas'
import theuz from './theuz'
import oxee from './oxee'
import sofadinha from './sofadinha'
import sojogomutado from './sojogomutado'
import eu_me_caguei from './eu_me_caguei'
import p0mb0 from './p0mb0'
import micael_pastel from './micael_pastel'

export const ALL_PLAYERS: Player[] = [
    // TOPs
    jeiel_up, bpm_zecapagod, chogato027es, cap_farinha,
    mielcohen, chenderboy, kissidane, osurt,
    // JUNGLEs
    galorural, bshadow7, vo_corvo, zerochannn,
    zangrando, vks_bmag, pdj_shaco_facao, robinhogamer17, veio_do_whatsapp,
    // MIDs
    castro_yse, enzogostoso123, ruim_e_esquisito, kirah,
    o_bobo, danverii, frenezeri, azir_de_warmog,
    // ADCs
    lippeh, nkz, elgato, rluperini,
    thaaylady, loose, megaextro, criz,
    // SUPPORTs
    e_o_puxas, theuz, oxee, sofadinha,
    sojogomutado, eu_me_caguei, p0mb0, micael_pastel,
]

export function getPlayersByRole(role: string): Player[] {
    return ALL_PLAYERS.filter(p => p.role === role)
}
