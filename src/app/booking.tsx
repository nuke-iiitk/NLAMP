import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

import FormField from '../components/FormField';
import InfoCard, { MetaRow } from '../components/InfoCard';
import Button from '../components/Button';
import ScreenShell from '../components/ScreenShell';
import SearchableSelect from '../components/SearchableSelect';
import SectionHeading from '../components/SectionHeading';
import { Colors, Radius, Spacing } from '../constants/theme';
import { getStateOptions, getDistrictOptions } from '../data/indiaLocations';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { APP_ICONS, AppIcon } from '../components/AppIcon';

export default function ProposalSubmissionScreen() {
  const { t, fs } = useI18n();
  const { width } = useWindowDimensions();
  const wide = width >= 768;

  // 7 Steps: 1. Project Details -> 2. Land Requirement -> 3. Location -> 4. Affected Families -> 5. Documents -> 6. Review -> 7. Submit
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Form Fields State
  const [projectName, setProjectName] = useState('NH-544 Salem-Kochi Greenfield Bypass');
  const [projectSector, setProjectSector] = useState('Highways');
  const [implementingAgency, setImplementingAgency] = useState('National Highways Authority of India (NHAI)');
  const [projectCostCr, setProjectCostCr] = useState('420.5');

  const [landProposedHa, setLandProposedHa] = useState('185.0');
  const [agriculturalHa, setAgriculturalHa] = useState('140.0');
  const [forestGovtHa, setForestGovtHa] = useState('35.0');
  const [commercialHa, setCommercialHa] = useState('10.0');

  const [selectedState, setSelectedState] = useState<string | null>('Kerala');
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>('Palakkad');
  const [tehsilName, setTehsilName] = useState('Alathur');
  const [revenueVillages, setRevenueVillages] = useState('Kavassery, Tarur, Vadakkencherry');

  const [affectedFamiliesCount, setAffectedFamiliesCount] = useState('340');
  const [displacedCount, setDisplacedCount] = useState('85');
  const [scStFamilies, setScStFamilies] = useState('42');
  const [livelihoodsAffected, setLivelihoodsAffected] = useState('120');

  const [dprUploaded, setDprUploaded] = useState(true);
  const [cadastralMapUploaded, setCadastralMapUploaded] = useState(true);
  const [siaReportUploaded, setSiaReportUploaded] = useState(true);

  const stateOptions = useMemo(() => getStateOptions(), []);
  const districtOptions = useMemo(
    () => (selectedState ? getDistrictOptions(selectedState) : []),
    [selectedState]
  );

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 6) {
      setCurrentStep(7);
      setSubmitted(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <ScreenShell wide breadcrumbs={[{ label: 'Home', href: path.home }, { label: 'Submit Proposal' }]}>
      <SectionHeading
        title="Land Acquisition Proposal Submission Wizard"
        subtitle="Step-by-step statutory requisition under Section 4 of RFCTLARR Act 2013 for National Infrastructure Corridors."
      />

      {/* 7-Step Progress Indicator Bar */}
      <View style={styles.wizardStepsBar}>
        {[
          '1. Project Details',
          '2. Land Requirement',
          '3. Location',
          '4. Affected Families',
          '5. Documents',
          '6. Review',
          '7. Submit',
        ].map((title, i) => {
          const stepNum = i + 1;
          const isDone = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;

          return (
            <View key={title} style={styles.stepItem}>
              <View
                style={[
                  styles.stepBadge,
                  isDone && styles.stepBadgeDone,
                  isCurrent && styles.stepBadgeCurrent,
                ]}
              >
                <Text
                  style={[
                    styles.stepBadgeNum,
                    (isDone || isCurrent) && styles.stepBadgeNumWhite,
                    { fontSize: fs(11) },
                  ]}
                >
                  {isDone ? '✓' : stepNum}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepTitle,
                  isCurrent && styles.stepTitleCurrent,
                  { fontSize: fs(10) },
                ]}
                numberOfLines={1}
              >
                {title.replace(/^\d+\.\s*/, '')}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Main Wizard Form Container */}
      <View style={styles.formContainer}>
        {/* STEP 1: Project Details */}
        {currentStep === 1 && (
          <View style={styles.stepSection}>
            <Text style={[styles.stepHeading, { fontSize: fs(16) }]}>Step 1: Project Details & Agency</Text>
            <FormField
              label="Infrastructure Project Name"
              value={projectName}
              onChangeText={setProjectName}
              placeholder="e.g. NH-66 6-Lane Coastal Expansion"
              required
            />
            <FormField
              label="Infrastructure Sector"
              value={projectSector}
              onChangeText={setProjectSector}
              placeholder="Highways, Railways, Energy, Industrial, Urban Infra"
              required
            />
            <FormField
              label="Implementing Agency / Requiring Body"
              value={implementingAgency}
              onChangeText={setImplementingAgency}
              placeholder="e.g. NHAI, DFCCIL, State PWD, NTPC"
              required
            />
            <FormField
              label="Estimated Overall Project Cost (₹ Crores)"
              value={projectCostCr}
              onChangeText={setProjectCostCr}
              placeholder="e.g. 420.5"
              required
            />
          </View>
        )}

        {/* STEP 2: Land Requirement */}
        {currentStep === 2 && (
          <View style={styles.stepSection}>
            <Text style={[styles.stepHeading, { fontSize: fs(16) }]}>Step 2: Land Requirement Breakdown</Text>
            <FormField
              label="Total Land Proposed (Hectares)"
              value={landProposedHa}
              onChangeText={setLandProposedHa}
              placeholder="e.g. 185.0"
              required
            />
            <FormField
              label="Agricultural Land Requirement (ha)"
              value={agriculturalHa}
              onChangeText={setAgriculturalHa}
              placeholder="e.g. 140.0"
              required
            />
            <FormField
              label="Forest / Government Land Requirement (ha)"
              value={forestGovtHa}
              onChangeText={setForestGovtHa}
              placeholder="e.g. 35.0"
              required
            />
            <FormField
              label="Commercial / Residential Land Requirement (ha)"
              value={commercialHa}
              onChangeText={setCommercialHa}
              placeholder="e.g. 10.0"
              required
            />
          </View>
        )}

        {/* STEP 3: Location */}
        {currentStep === 3 && (
          <View style={styles.stepSection}>
            <Text style={[styles.stepHeading, { fontSize: fs(16) }]}>Step 3: Geographic & Revenue Location</Text>
            <SearchableSelect
              label="State / Union Territory"
              value={selectedState}
              placeholder="Select State"
              options={stateOptions}
              onSelect={(val) => {
                setSelectedState(val || null);
                setSelectedDistrict(null);
              }}
              required
            />
            <SearchableSelect
              label="District"
              value={selectedDistrict}
              placeholder="Select District"
              options={districtOptions}
              disabled={!selectedState}
              onSelect={(val) => setSelectedDistrict(val || null)}
              required
            />
            <FormField
              label="Tehsil / Taluk / Sub-division"
              value={tehsilName}
              onChangeText={setTehsilName}
              placeholder="e.g. Alathur"
              required
            />
            <FormField
              label="Affected Revenue Villages"
              value={revenueVillages}
              onChangeText={setRevenueVillages}
              placeholder="Comma separated village names"
              required
            />
          </View>
        )}

        {/* STEP 4: Affected Families */}
        {currentStep === 4 && (
          <View style={styles.stepSection}>
            <Text style={[styles.stepHeading, { fontSize: fs(16) }]}>Step 4: Affected Families & SIA Estimates</Text>
            <FormField
              label="Total Affected Families (SIA Preliminary Estimate)"
              value={affectedFamiliesCount}
              onChangeText={setAffectedFamiliesCount}
              placeholder="e.g. 340"
              required
            />
            <FormField
              label="Expected Displaced Families"
              value={displacedCount}
              onChangeText={setDisplacedCount}
              placeholder="e.g. 85"
              required
            />
            <FormField
              label="Scheduled Castes / Scheduled Tribes Families"
              value={scStFamilies}
              onChangeText={setScStFamilies}
              placeholder="e.g. 42"
              required
            />
            <FormField
              label="Non-titleholder / Livelihood Dependent Persons"
              value={livelihoodsAffected}
              onChangeText={setLivelihoodsAffected}
              placeholder="e.g. 120"
              required
            />
          </View>
        )}

        {/* STEP 5: Documents */}
        {currentStep === 5 && (
          <View style={styles.stepSection}>
            <Text style={[styles.stepHeading, { fontSize: fs(16) }]}>Step 5: Mandatory Document Uploads</Text>
            <View style={styles.docUploadItem}>
              <View style={styles.docUploadInfo}>
                <AppIcon name={APP_ICONS.documentText} size={20} color={Colors.primary} />
                <View>
                  <Text style={[styles.docUploadTitle, { fontSize: fs(13) }]}>Detailed Project Report (DPR) Extract</Text>
                  <Text style={[styles.docUploadStatus, { fontSize: fs(11) }]}>Status: DPR_Final_Alignment_v1.0.pdf (12.4 MB)</Text>
                </View>
              </View>
              <Button variant="outline-primary" label="Replace" onPress={() => undefined} small />
            </View>

            <View style={styles.docUploadItem}>
              <View style={styles.docUploadInfo}>
                <AppIcon name={APP_ICONS.map} size={20} color={Colors.primary} />
                <View>
                  <Text style={[styles.docUploadTitle, { fontSize: fs(13) }]}>Cadastral Survey & Geo-referenced Alignment Map</Text>
                  <Text style={[styles.docUploadStatus, { fontSize: fs(11) }]}>Status: Cadastral_GIS_Overlay_Khasra.geojson (18.2 MB)</Text>
                </View>
              </View>
              <Button variant="outline-primary" label="Replace" onPress={() => undefined} small />
            </View>

            <View style={styles.docUploadItem}>
              <View style={styles.docUploadInfo}>
                <AppIcon name={APP_ICONS.shieldCheckmark} size={20} color={Colors.primary} />
                <View>
                  <Text style={[styles.docUploadTitle, { fontSize: fs(13) }]}>Preliminary Social Impact Assessment (SIA) Terms</Text>
                  <Text style={[styles.docUploadStatus, { fontSize: fs(11) }]}>Status: Draft_SIA_Scope_TOR.pdf (4.6 MB)</Text>
                </View>
              </View>
              <Button variant="outline-primary" label="Replace" onPress={() => undefined} small />
            </View>
          </View>
        )}

        {/* STEP 6: Review */}
        {currentStep === 6 && (
          <View style={styles.stepSection}>
            <Text style={[styles.stepHeading, { fontSize: fs(16) }]}>Step 6: Review Proposal Summary</Text>
            <InfoCard title="Requisition Summary">
              <MetaRow label="Project Name" value={projectName} />
              <MetaRow label="Sector / Agency" value={`${projectSector} · ${implementingAgency}`} />
              <MetaRow label="Total Land Required" value={`${landProposedHa} ha`} />
              <MetaRow label="Agricultural / Forest" value={`${agriculturalHa} ha / ${forestGovtHa} ha`} />
              <MetaRow label="Location" value={`${tehsilName}, ${selectedDistrict}, ${selectedState}`} />
              <MetaRow label="Revenue Villages" value={revenueVillages} />
              <MetaRow label="Affected Families" value={`${affectedFamiliesCount} (${displacedCount} displaced)`} />
              <MetaRow label="Estimated Project Cost" value={`₹${projectCostCr} Cr`} />
            </InfoCard>
          </View>
        )}

        {/* STEP 7: Submit Confirmation */}
        {currentStep === 7 && submitted && (
          <View style={styles.confirmationBox}>
            <View style={styles.confirmBadge}>
              <AppIcon name={APP_ICONS.checkmarkCircle} size={48} color={Colors.green} />
            </View>
            <Text style={[styles.confirmTitle, { fontSize: fs(20) }]}>
              Proposal Successfully Submitted
            </Text>
            <Text style={[styles.confirmCode, { fontSize: fs(14) }]}>
              Requisition Reference ID: PROP-2026-KL-094
            </Text>
            <Text style={[styles.confirmDesc, { fontSize: fs(13) }]}>
              The requisition has been routed to the District Collector and State Revenue Department for Section 4 SIA notification and Expert Group scrutiny.
            </Text>
            <View style={styles.confirmActions}>
              <Button
                label="View in Project Directory"
                onPress={() => router.push(path.projects as never)}
              />
              <Button
                variant="outline-primary"
                label="Return to Dashboard"
                onPress={() => router.push(path.dashboard as never)}
              />
            </View>
          </View>
        )}

        {/* Navigation Buttons */}
        {currentStep < 7 ? (
          <View style={styles.wizardNav}>
            {currentStep > 1 ? (
              <Button variant="outline-primary" label="Previous Step" onPress={handleBack} />
            ) : <View />}

            <Button
              variant="primary"
              label={currentStep === 6 ? 'Confirm & Submit to State SLAO' : 'Next Step'}
              onPress={handleNext}
            />
          </View>
        ) : null}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  wizardStepsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    flexWrap: 'wrap',
    gap: 8,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 70,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepBadgeDone: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  stepBadgeCurrent: {
    backgroundColor: Colors.saffron,
    borderColor: Colors.saffronDark,
  },
  stepBadgeNum: {
    fontWeight: '800',
    color: Colors.textMuted,
  },
  stepBadgeNumWhite: {
    color: Colors.white,
  },
  stepTitle: {
    color: Colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepTitleCurrent: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  formContainer: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: Radius.sm,
    padding: Spacing.lg,
  },
  stepSection: {
    gap: Spacing.sm,
  },
  stepHeading: {
    color: Colors.primaryDark,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  docUploadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
    gap: 12,
  },
  docUploadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
    minWidth: 240,
  },
  docUploadTitle: {
    fontWeight: '700',
    color: Colors.text,
  },
  docUploadStatus: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  wizardNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  confirmationBox: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  confirmBadge: {
    marginBottom: Spacing.sm,
  },
  confirmTitle: {
    color: Colors.primaryDark,
    fontWeight: '800',
    textAlign: 'center',
  },
  confirmCode: {
    color: Colors.saffronDark,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  confirmDesc: {
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: 20,
    marginTop: 4,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
